import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createRemoteJWKSet, jwtVerify } from "jose";

interface Env {
  B2_KEY_ID: string;
  B2_APPLICATION_KEY: string;
  ALLOWED_ORIGINS?: string;
}
const PROJECT_ID = "sixseven-c86ac";
const ENDPOINT = "https://s3.us-east-005.backblazeb2.com";
const REGION = "us-east-005";
const jwks = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));
const buckets: Record<string, string> = {
  profile: "sixseven-profiles",
  cover: "sixseven-covers",
  image: "sixseven-images",
  audio: "sixseven-audios",
  video: "sixseven-images",
};
const maxBytes: Record<string, number> = {
  profile: 20 * 1024 * 1024, cover: 20 * 1024 * 1024, image: 20 * 1024 * 1024,
  audio: 100 * 1024 * 1024, video: 100 * 1024 * 1024,
};
const allowedMime: Record<string, RegExp> = {
  profile: /^image\/(jpeg|png|webp|gif)$/,
  cover: /^image\/(jpeg|png|webp|gif)$/,
  image: /^image\/(jpeg|png|webp|gif)$/,
  audio: /^(audio\/[a-z0-9.+-]+|application\/octet-stream)$/,
  video: /^(video\/[a-z0-9.+-]+|application\/octet-stream)$/,
};
function response(body: unknown, status = 200, origin?: string, allowed = false): Response {
  const headers = new Headers({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  if (origin && allowed) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
    headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set("Access-Control-Max-Age", "86400");
  }
  return new Response(JSON.stringify(body), { status, headers });
}
function safeOrigin(origin: string | null, env: Env): boolean {
  if (!origin) return true; // Native clients may omit Origin; Firebase ID token is still required.
  const configured = (env.ALLOWED_ORIGINS || "capacitor://localhost,http://localhost,https://localhost")
    .split(",").map(value => value.trim()).filter(Boolean);
  return configured.includes(origin);
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const allowed = safeOrigin(origin, env);
    if (request.method === "OPTIONS") {
      return allowed ? new Response(null, { status: 204, headers: {
        "Access-Control-Allow-Origin": origin || "*",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin"
      } }) : response({ error: "Origen no autorizado." }, 403);
    }
    if (!allowed) return response({ error: "Origen no autorizado. Configurá ALLOWED_ORIGINS en Cloudflare." }, 403);
    const url = new URL(request.url);
    if (url.pathname === "/health" && request.method === "GET") {
      return response({ service: "SixSeven Backblaze signer", status: "ok" }, 200, origin || undefined, allowed);
    }
    if (url.pathname !== "/upload-url" || request.method !== "POST") {
      return response({ error: "Ruta no encontrada." }, 404, origin || undefined, allowed);
    }
    const authorization = request.headers.get("Authorization") || "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (!token) return response({ error: "Iniciá sesión en SixSeven para subir archivos." }, 401, origin || undefined, allowed);
    let uid: string;
    try {
      const verified = await jwtVerify(token, jwks, {
        issuer: `https://securetoken.google.com/${PROJECT_ID}`,
        audience: PROJECT_ID,
      });
      if (verified.payload.firebase === undefined || typeof verified.payload.sub !== "string") throw new Error("Invalid Firebase token");
      uid = verified.payload.sub;
    } catch {
      return response({ error: "La sesión no es válida o venció. Volvé a iniciar sesión." }, 401, origin || undefined, allowed);
    }
    let body: { kind?: unknown; contentType?: unknown; fileName?: unknown; fileSize?: unknown };
    try { body = await request.json(); } catch { return response({ error: "Solicitud inválida." }, 400, origin || undefined, allowed); }
    const kind = typeof body.kind === "string" ? body.kind : "";
    const contentType = typeof body.contentType === "string" ? body.contentType.toLowerCase().split(";")[0].trim() : "";
    const fileSize = Number(body.fileSize);
    if (!(kind in buckets)) return response({ error: "Tipo de archivo no permitido." }, 400, origin || undefined, allowed);
    if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > maxBytes[kind]) {
      return response({ error: `El archivo supera el límite permitido para ${kind}.` }, 413, origin || undefined, allowed);
    }
    if (!allowedMime[kind].test(contentType)) return response({ error: "El formato de archivo no está permitido." }, 415, origin || undefined, allowed);
    const extByMime: Record<string, string> = {
      "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif",
      "audio/mpeg": "mp3", "audio/mp4": "m4a", "audio/ogg": "ogg", "audio/wav": "wav",
      "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov",
    };
    const ext = extByMime[contentType] || "bin";
    const objectKey = `${uid}/${kind}/${crypto.randomUUID()}.${ext}`;
    try {
      const client = new S3Client({
        region: REGION,
        endpoint: ENDPOINT,
        forcePathStyle: true,
        credentials: { accessKeyId: env.B2_KEY_ID, secretAccessKey: env.B2_APPLICATION_KEY },
      });
      const command = new PutObjectCommand({ Bucket: buckets[kind], Key: objectKey, ContentType: contentType });
      const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
      const publicUrl = `https://${buckets[kind]}.${ENDPOINT.replace("https://", "")}/${objectKey.split("/").map(encodeURIComponent).join("/")}`;
      return response({ uploadUrl, publicUrl, objectKey, bucket: buckets[kind], method: "PUT", headers: { "Content-Type": contentType }, expiresInSeconds: 300 }, 200, origin || undefined, allowed);
    } catch (error) {
      console.error("Signing upload URL failed", error instanceof Error ? error.message : "unknown error");
      return response({ error: "No se pudo preparar la subida. Revisá la configuración del servicio." }, 500, origin || undefined, allowed);
    }
  },
};
