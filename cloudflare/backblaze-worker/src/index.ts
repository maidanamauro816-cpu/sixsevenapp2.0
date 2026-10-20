import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createRemoteJWKSet, jwtVerify } from "jose";

interface Env {
  B2_KEY_ID: string;
  B2_APPLICATION_KEY?: string;
  B2_APP_KEY?: string;
  B2_BUCKET_NAME?: string;
  B2_ENDPOINT?: string;
  GEMINI_API_KEY?: string;
}

const PROJECT_ID = "sixseven-c86ac";
const DEFAULT_ENDPOINT = "https://s3.us-east-005.backblazeb2.com";
const REGION = "us-east-005";
const jwks = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));
const buckets: Record<string, string> = {
  profile: "sixseven-profiles", cover: "sixseven-covers", image: "sixseven-images",
  audio: "sixseven-audios", video: "sixseven-images",
};
const maxBytes: Record<string, number> = {
  profile: 10 * 1024 * 1024, cover: 10 * 1024 * 1024, image: 20 * 1024 * 1024,
  audio: 100 * 1024 * 1024, video: 100 * 1024 * 1024,
};
const allowedMime: Record<string, RegExp> = {
  profile: /^image\/(jpeg|png|webp|gif)$/, cover: /^image\/(jpeg|png|webp|gif)$/,
  image: /^image\/(jpeg|png|webp|gif)$/, audio: /^(audio\/[a-z0-9.+-]+|application\/octet-stream)$/,
  video: /^(video\/[a-z0-9.+-]+|application\/octet-stream)$/,
};

function corsHeaders(): Headers {
  return new Headers({
    "Access-Control-Allow-Origin": "https://sixsevenapp2-0.web.app",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  });
}
function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders() });
}
function b2Credentials(env: Env) {
  const secret = env.B2_APP_KEY || env.B2_APPLICATION_KEY;
  if (!env.B2_KEY_ID || !secret) throw new Error("Faltan las credenciales de Backblaze B2 en el Worker.");
  return { accessKeyId: env.B2_KEY_ID, secretAccessKey: secret };
}
function b2Endpoint(env: Env): string {
  let endpoint = (env.B2_ENDPOINT || DEFAULT_ENDPOINT).trim().replace(/\/$/, "");
  if (!endpoint.startsWith("https://")) endpoint = `https://${endpoint}`;
  return endpoint;
}
function s3Client(env: Env): S3Client {
  return new S3Client({ region: REGION, endpoint: b2Endpoint(env), forcePathStyle: true, credentials: b2Credentials(env) });
}
function publicFileUrl(bucket: string, key: string, endpoint: string): string {
  const host = new URL(endpoint).hostname;
  const match = host.match(/^s3\.([a-z0-9-]+)\.backblazeb2\.com$/i);
  if (match) {
    const regionNumber = match[1].match(/(?:^|-)\d+$/)?.[0]?.replace("-", "") || "005";
    const fHost = `f${regionNumber.padStart(3, "0")}.backblazeb2.com`;
    return `https://${fHost}/file/${encodeURIComponent(bucket)}/${key.split("/").map(encodeURIComponent).join("/")}`;
  }
  return `${endpoint}/${encodeURIComponent(bucket)}/${key.split("/").map(encodeURIComponent).join("/")}`;
}
async function verifyUser(request: Request): Promise<string | null> {
  const authorization = request.headers.get("Authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return null;
  try {
    const verified = await jwtVerify(token, jwks, { issuer: `https://securetoken.google.com/${PROJECT_ID}`, audience: PROJECT_ID });
    if (verified.payload.firebase === undefined || typeof verified.payload.sub !== "string") return null;
    return verified.payload.sub;
  } catch { return null; }
}

async function askGemini(request: Request, env: Env): Promise<Response> {
  if (!env.GEMINI_API_KEY?.trim()) {
    return response({ code: "ai_not_configured", error: "La IA todavía no está activada. Volvé a ejecutar el workflow Deploy SixSeven Gemini Worker para configurar el secreto de Cloudflare." }, 503);
  }
  let body: { message?: unknown };
  try { body = await request.json(); }
  catch { return response({ code: "invalid_request", error: "La solicitud de IA no es válida." }, 400); }
  const prompt = typeof body.message === "string" ? body.message.trim() : "";
  if (!prompt) return response({ code: "empty_message", error: "Escribí o decí qué necesitás." }, 400);
  if (prompt.length > 4000) return response({ code: "message_too_long", error: "El mensaje es demasiado largo (máximo 4000 caracteres)." }, 413);
  try {
    const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY.trim() },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "Sos SixSeven IA, el asistente oficial de la app SixSeven. Respondé siempre en español latinoamericano, con tono amable, claro y natural de Argentina. Usá voseo argentino cuando suene natural. Ayudá con consultas generales y con el uso de SixSeven. La app tiene Chats, Estados, Música, Llamadas, Perfil y configuración. No afirmes haber ejecutado acciones que la app no te haya permitido realizar. Si no sabés algo, decilo con honestidad. Mantené las respuestas concisas y útiles." }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 900, temperature: 0.7, topP: 0.9 },
      }),
    });
    const payload = await upstream.json().catch(() => ({})) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; error?: { message?: string; status?: string } };
    if (!upstream.ok) {
      console.error("Gemini API request failed", upstream.status, payload.error?.status || "unknown");
      if (upstream.status === 429) return response({ code: "quota_exceeded", error: "Se alcanzó el límite gratuito de Gemini por ahora. Esperá a que se renueve la cuota y volvé a intentar." }, 429);
      if ([400, 401, 403, 404].includes(upstream.status)) return response({ code: "gemini_key_or_model_error", error: "Google Gemini rechazó la solicitud. Revisá la clave de AI Studio y el acceso al modelo." }, 502);
      return response({ code: "gemini_unavailable", error: "Gemini no está disponible en este momento. Intentá de nuevo en un rato." }, 502);
    }
    const answer = (payload.candidates || []).flatMap((candidate) => candidate.content?.parts || []).map((part) => part.text || "").join("").trim();
    if (!answer) return response({ code: "empty_response", error: "Gemini no devolvió texto. Probá de nuevo con otra pregunta." }, 502);
    return response({ answer }, 200);
  } catch (error) {
    console.error("Gemini request failed", error instanceof Error ? error.message : "unknown error");
    return response({ code: "network_error", error: "No se pudo conectar con Gemini. Revisá tu conexión e intentá de nuevo." }, 502);
  }
}
async function uploadMultipart(request: Request, env: Env, uid: string, kind: "profile" | "cover"): Promise<Response> {
  let form: FormData;
  try { form = await request.formData(); } catch { return response({ error: "El formulario de subida no es válido." }, 400); }
  const candidate = form.get("file") || form.get("photo") || form.get("avatar") || form.get("cover");
  if (!(candidate instanceof File) || candidate.size <= 0) return response({ error: "Falta el archivo de imagen en el campo file." }, 400);
  if (candidate.size > maxBytes[kind]) return response({ error: "La imagen supera el límite de 10 MB." }, 413);
  const contentType = (candidate.type || "").toLowerCase().split(";")[0].trim();
  if (!allowedMime[kind].test(contentType)) return response({ error: "Formato no permitido. Usá JPG, PNG, WebP o GIF." }, 415);
  const bucket = env.B2_BUCKET_NAME?.trim() || buckets[kind];
  const extByMime: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
  const key = kind === "cover" ? `portadas/${uid}.jpg` : `avatars/${uid}/${crypto.randomUUID()}.${extByMime[contentType] || "img"}`;
  const endpoint = b2Endpoint(env);
  try {
    await s3Client(env).send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: new Uint8Array(await candidate.arrayBuffer()), ContentType: contentType }));
    return response({ url: publicFileUrl(bucket, key, endpoint), key, bucket }, 200);
  } catch (error) {
    console.error("Backblaze upload failed", error instanceof Error ? error.message : "unknown error");
    return response({ error: "No se pudo guardar la imagen en Backblaze. Revisá las credenciales, el bucket y sus permisos." }, 502);
  }
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      const headers = corsHeaders();
      const origin = request.headers.get("Origin") || "";
      if (origin === "https://sixsevenapp2-0.web.app" || origin === "http://localhost:3000" || origin.endsWith(".web.app")) headers.set("Access-Control-Allow-Origin", origin);
      return new Response(null, { status: 200, headers });
    }
    const url = new URL(request.url);
    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/health" || url.pathname === "/api/health")) return response({ ok: true, service: "SixSeven Backblaze + Gemini Worker", status: "ok" });
    if (request.method === "POST" && url.pathname === "/api/ask-gemini") {
      const uid = await verifyUser(request);
      if (!uid) return response({ code: "unauthenticated", error: "Iniciá sesión en SixSeven para usar la IA." }, 401);
      return askGemini(request, env);
    }
    if (request.method === "POST" && (url.pathname === "/api/upload-avatar" || url.pathname === "/api/upload-cover")) {
      const uid = await verifyUser(request);
      if (!uid) return response({ error: "La sesión no es válida. Volvé a iniciar sesión en SixSeven." }, 401);
      return uploadMultipart(request, env, uid, url.pathname.endsWith("upload-avatar") ? "profile" : "cover");
    }
    if (request.method === "POST" && url.pathname === "/upload-url") {
      const uid = await verifyUser(request);
      if (!uid) return response({ error: "La sesión no es válida. Volvé a iniciar sesión en SixSeven." }, 401);
      let body: { kind?: unknown; contentType?: unknown; fileName?: unknown; fileSize?: unknown };
      try { body = await request.json(); } catch { return response({ error: "Solicitud inválida." }, 400); }
      const kind = typeof body.kind === "string" ? body.kind : "";
      const contentType = typeof body.contentType === "string" ? body.contentType.toLowerCase().split(";")[0].trim() : "";
      const fileSize = Number(body.fileSize);
      if (!(kind in buckets)) return response({ error: "Tipo de archivo no permitido." }, 400);
      if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > maxBytes[kind]) return response({ error: `El archivo supera el límite permitido para ${kind}.` }, 413);
      if (!allowedMime[kind].test(contentType)) return response({ error: "El formato de archivo no está permitido." }, 415);
      const extByMime: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "audio/mpeg": "mp3", "audio/mp4": "m4a", "audio/ogg": "ogg", "audio/wav": "wav", "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" };
      const ext = extByMime[contentType] || "bin";
      const objectKey = `${uid}/${kind}/${crypto.randomUUID()}.${ext}`;
      const bucket = buckets[kind];
      try {
        const client = s3Client(env);
        const command = new PutObjectCommand({ Bucket: bucket, Key: objectKey, ContentType: contentType });
        const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
        return response({ uploadUrl, publicUrl: publicFileUrl(bucket, objectKey, b2Endpoint(env)), objectKey, bucket, method: "PUT", headers: { "Content-Type": contentType }, expiresInSeconds: 300 });
      } catch (error) {
        console.error("Signing upload URL failed", error instanceof Error ? error.message : "unknown error");
        return response({ error: "No se pudo preparar la subida. Revisá la configuración del servicio." }, 500);
      }
    }
    return response({ error: "Ruta no encontrada." }, 404);
  },
};
