import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const required = ['MONGO_URL', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key] || (key === 'JWT_SECRET' && process.env[key].length < 32)) {
    console.error(`Configuration missing or unsafe: ${key}`);
    process.exit(1);
  }
}
const app = express();
const httpServer = createServer(app);
const origins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '256kb' }));
app.use(cors({ origin(origin, cb) {
  if (!origin || origins.includes(origin)) return cb(null, true);
  return cb(new Error('origin_not_allowed'));
}, methods: ['GET', 'POST'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use('/api/', rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 2, maxlength: 32, lowercase: true },
  displayName: { type: String, required: true, trim: true, maxlength: 80 },
  passwordHash: { type: String, required: true, select: false },
  plan: { type: String, enum: ['free', 'premium', 'business'], default: 'free' },
  businessVerified: { type: Boolean, default: false },
  orbUsage: { day: { type: String, default: '' }, count: { type: Number, default: 0 } },
}, { timestamps: true });
const messageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, maxlength: 4000 },
}, { timestamps: true });
messageSchema.index({ conversationId: 1, createdAt: -1 });
const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);
const r2Ready = Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET);
const s3 = r2Ready ? new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
}) : null;

function tokenFor(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d', issuer: 'six-seven-api', audience: 'six-seven-app' });
}
async function auth(req, res, next) {
  try {
    const raw = req.headers.authorization || '';
    const token = raw.startsWith('Bearer ') ? raw.slice(7) : '';
    const payload = jwt.verify(token, process.env.JWT_SECRET, { issuer: 'six-seven-api', audience: 'six-seven-app' });
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'unauthorized' });
    req.user = user;
    next();
  } catch { return res.status(401).json({ error: 'unauthorized' }); }
}
function publicUser(user) {
  return { id: user._id.toString(), username: user.username, displayName: user.displayName, plan: user.plan, businessVerified: user.businessVerified };
}
app.get('/health', (_req, res) => res.json({ service: 'six-seven-api', status: 'ok' }));
app.get('/ready', (_req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ status: mongoose.connection.readyState === 1 ? 'ready' : 'not_ready', database: mongoose.connection.readyState === 1 ? 'ok' : 'unavailable' }));
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const username = String(req.body?.username || '').trim().toLowerCase();
    const displayName = String(req.body?.displayName || '').trim();
    const password = String(req.body?.password || '');
    if (!/^[a-z0-9_.]{2,32}$/.test(username) || displayName.length < 1 || displayName.length > 80 || password.length < 10 || password.length > 128)
      return res.status(400).json({ error: 'invalid_registration', details: 'Usuario 2-32 caracteres; contraseña 10-128.' });
    const user = await User.create({ username, displayName, passwordHash: await bcrypt.hash(password, 12) });
    return res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
  } catch (e) {
    if (e?.code === 11000) return res.status(409).json({ error: 'username_taken' });
    next(e);
  }
});
app.post('/api/auth/login', async (req, res) => {
  const username = String(req.body?.username || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const user = await User.findOne({ username }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'invalid_credentials' });
  res.json({ token: tokenFor(user), user: publicUser(user) });
});
app.get('/api/me', auth, (req, res) => res.json({ user: publicUser(req.user) }));
app.get('/api/contacts', auth, async (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase().slice(0, 50);
  if (q.length < 2) return res.json({ contacts: [] });
  const users = await User.find({ _id: { $ne: req.user._id }, $or: [{ username: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') } }, { displayName: { $regex: q, $options: 'i' } }] }).limit(20);
  res.json({ contacts: users.map(publicUser) });
});
app.get('/api/messages/:conversationId', auth, async (req, res) => {
  const id = String(req.params.conversationId || '');
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id)) return res.status(400).json({ error: 'invalid_conversation_id' });
  const messages = await Message.find({ conversationId: id }).sort({ createdAt: -1 }).limit(50).lean();
  res.json({ messages: messages.reverse().map(m => ({ id: m._id.toString(), conversationId: m.conversationId, senderId: m.senderId.toString(), text: m.text, createdAt: m.createdAt })) });
});
app.post('/api/sixseven/use', auth, async (req, res) => {
  const user = req.user;
  if (user.plan !== 'free') return res.json({ allowed: true, remaining: null, plan: user.plan });
  const today = new Date().toISOString().slice(0, 10);
  if (user.orbUsage.day !== today) { user.orbUsage.day = today; user.orbUsage.count = 0; }
  const limit = Math.max(1, Math.min(20, Number(process.env.FREE_ORB_USES_PER_DAY || 5)));
  if (user.orbUsage.count >= limit) return res.status(402).json({ allowed: false, remaining: 0, paywall: { title: 'Desbloqueá SIX SEVEN ilimitado', price: process.env.PREMIUM_PRICE_LABEL || 'ARS 2000/mes', trialDays: 7 } });
  user.orbUsage.count += 1;
  await user.save();
  res.json({ allowed: true, remaining: limit - user.orbUsage.count, plan: user.plan });
});
app.get('/api/plans', (_req, res) => res.json({ plans: [
  { id: 'free', name: 'Gratis', price: 'ARS 0', features: ['Chat ilimitado', '5 usos diarios de SIX SEVEN'] },
  { id: 'premium', name: 'Premium', price: process.env.PREMIUM_PRICE_LABEL || 'ARS 2000/mes', trialDays: 7, features: ['SIX SEVEN ilimitado', 'Resúmenes de chat', 'Dictado y redacción por voz', 'Agenda de llamadas', 'Respuestas automáticas'] },
  { id: 'business', name: 'Business', price: process.env.BUSINESS_PRICE_LABEL || 'ARS 5000/mes', features: ['Perfil comercial', 'Catálogo', 'Respuestas automáticas', 'Verificación manual'] },
] }));
app.post('/api/media/presign', auth, async (req, res) => {
  if (!s3) return res.status(503).json({ error: 'r2_not_configured' });
  const type = String(req.body?.contentType || '');
  const size = Number(req.body?.size || 0);
  const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'audio/webm', 'audio/mpeg']);
  if (!allowed.has(type) || !Number.isSafeInteger(size) || size < 1 || size > 25 * 1024 * 1024) return res.status(400).json({ error: 'invalid_media' });
  const key = `users/${req.user._id}/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}`;
  const command = new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key, ContentType: type, ContentLength: size });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  res.json({ uploadUrl, key, expiresInSeconds: 300, publicUrl: process.env.R2_PUBLIC_BASE_URL ? `${process.env.R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/${key}` : null });
});
app.use((err, _req, res, _next) => {
  if (err?.message === 'origin_not_allowed') return res.status(403).json({ error: 'origin_not_allowed' });
  console.error('Unhandled API error:', err?.name || 'Error');
  res.status(500).json({ error: 'internal_server_error' });
});

const io = new Server(httpServer, { cors: { origin: origins, methods: ['GET', 'POST'] }, maxHttpBufferSize: 1e6 });
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    const payload = jwt.verify(token, process.env.JWT_SECRET, { issuer: 'six-seven-api', audience: 'six-seven-app' });
    socket.userId = payload.sub;
    next();
  } catch { next(new Error('unauthorized')); }
});
io.on('connection', socket => {
  socket.on('conversation:join', async ({ conversationId } = {}, ack = () => {}) => {
    if (typeof conversationId !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(conversationId)) return ack({ ok: false, error: 'invalid_conversation_id' });
    socket.join(`conversation:${conversationId}`);
    ack({ ok: true });
  });
  socket.on('message:send', async (data = {}, ack = () => {}) => {
    try {
      const conversationId = String(data.conversationId || '');
      const text = String(data.text || '').trim();
      if (!/^[a-zA-Z0-9_-]{1,100}$/.test(conversationId) || !text || text.length > 4000) return ack({ ok: false, error: 'invalid_message' });
      if (!socket.rooms.has(`conversation:${conversationId}`)) return ack({ ok: false, error: 'join_conversation_first' });
      const message = await Message.create({ conversationId, senderId: socket.userId, text });
      const item = { id: message._id.toString(), conversationId, senderId: socket.userId, text, createdAt: message.createdAt };
      io.to(`conversation:${conversationId}`).emit('message:new', item);
      ack({ ok: true, message: item });
    } catch { ack({ ok: false, error: 'message_failed' }); }
  });
});
await mongoose.connect(process.env.MONGO_URL);
const port = Number(process.env.PORT || 4000);
httpServer.listen(port, '0.0.0.0', () => console.log(`Six Seven API listening on ${port}`));
async function shutdown() { await new Promise(resolve => httpServer.close(resolve)); await mongoose.disconnect(); process.exit(0); }
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);