import { createHmac, randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { Readable } from 'node:stream';
import { google } from 'googleapis';

const scryptAsync = promisify(scrypt);
const COOKIE_NAME = 'stockmain_session';
const SESSION_DURATION = 60 * 60 * 12;
const ROOT_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

let driveClient;

function getDrive() {
  if (driveClient) return driveClient;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!email || !privateKey || !ROOT_ID || !process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    throw new Error('Configuração do servidor incompleta. Verifique as variáveis de ambiente do Google Drive e da sessão.');
  }
  const auth = new google.auth.JWT({ email, key: privateKey, scopes: ['https://www.googleapis.com/auth/drive'] });
  driveClient = google.drive({ version: 'v3', auth });
  return driveClient;
}

async function findFolder(name, parentId) {
  const drive = getDrive();
  const response = await drive.files.list({
    q: `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`,
    fields: 'files(id,name)',
    pageSize: 10,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });
  if (response.data.files?.length) return response.data.files[0].id;
  const created = await drive.files.create({
    requestBody: { name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] },
    fields: 'id',
    supportsAllDrives: true
  });
  return created.data.id;
}

async function ensureFolders() {
  const loginsId = await findFolder('Logins', ROOT_ID);
  const usersId = await findFolder('Usuarios', ROOT_ID);
  return { loginsId, usersId };
}

async function findJsonFile(name, parentId) {
  const response = await getDrive().files.list({
    q: `name = '${name}' and '${parentId}' in parents and trashed = false`,
    fields: 'files(id,name)',
    pageSize: 1,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });
  return response.data.files?.[0]?.id || null;
}

async function readJsonFile(fileId) {
  const response = await getDrive().files.get({ fileId, alt: 'media', supportsAllDrives: true });
  const chunks = [];
  for await (const chunk of response.data) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function writeJsonFile(name, parentId, value) {
  const drive = getDrive();
  const existingId = await findJsonFile(name, parentId);
  const media = { mimeType: 'application/json', body: Readable.from([JSON.stringify(value)]) };
  if (existingId) {
    await drive.files.update({ fileId: existingId, media, supportsAllDrives: true });
    return existingId;
  }
  const created = await drive.files.create({
    requestBody: { name, mimeType: 'application/json', parents: [parentId] },
    media,
    fields: 'id',
    supportsAllDrives: true
  });
  return created.data.id;
}

async function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const derivedKey = await scryptAsync(password, salt, 64);
  return { salt, hash: derivedKey.toString('hex') };
}

async function verifyPassword(password, salt, expectedHash) {
  if (!salt || !/^[a-f0-9]{128}$/i.test(String(expectedHash || ''))) return false;
  const actual = await scryptAsync(password, salt, 64);
  const expected = Buffer.from(expectedHash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function signSession(user) {
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    email: user.email,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION
  })).toString('base64url');
  const signature = createHmac('sha256', process.env.SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function readSession(token) {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = createHmac('sha256', process.env.SESSION_SECRET).update(payload).digest();
  const actual = Buffer.from(signature, 'base64url');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return session.exp < Math.floor(Date.now() / 1000) ? null : session;
  } catch {
    return null;
  }
}

function setCookie(res, value, maxAge = SESSION_DURATION) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${value}; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=${maxAge}`);
}

function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').map((part) => {
    const separator = part.indexOf('=');
    return separator < 0 ? ['', ''] : [part.slice(0, separator).trim(), part.slice(separator + 1).trim()];
  }).filter(([key]) => key));
}

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

async function getUserFiles() {
  const folders = await ensureFolders();
  const indexId = await findJsonFile('usuarios.json', folders.loginsId);
  const users = indexId ? await readJsonFile(indexId) : [];
  return { ...folders, users: Array.isArray(users) ? users : [] };
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Método não permitido.' });
  const origin = req.headers.origin;
  if (origin) {
    try {
      const originHost = new URL(origin).host.toLowerCase();
      const requestHost = String(req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase();
      if (!requestHost || originHost !== requestHost) return send(res, 403, { error: 'Origem da requisição não permitida.' });
    } catch {
      return send(res, 403, { error: 'Origem da requisição inválida.' });
    }
  }
  try {
    const body = await readBody(req);
    const action = String(body.action || '');
    const cookies = parseCookies(req);
    const session = readSession(cookies[COOKIE_NAME]);

    if (action === 'session') {
      return session ? send(res, 200, { authenticated: true, user: { id: session.sub, name: session.name, email: session.email } }) : send(res, 200, { authenticated: false });
    }

    if (action === 'logout') {
      setCookie(res, '', 0);
      return send(res, 200, { success: true });
    }

    if (action === 'register' || action === 'login') {
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const name = String(body.name || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) return send(res, 400, { error: 'Informe um e-mail válido.' });
      if (password.length < 10 || password.length > 128) return send(res, 400, { error: 'A senha deve ter entre 10 e 128 caracteres.' });
      const account = await getUserFiles();
      let user = account.users.find((item) => item.email === email);
      if (action === 'register') {
        if (user) return send(res, 409, { error: 'Já existe uma conta com este e-mail.' });
        if (name.length < 2 || name.length > 80) return send(res, 400, { error: 'Informe seu nome completo.' });
        const passwordData = await hashPassword(password);
        user = { id: randomUUID(), name, email, passwordSalt: passwordData.salt, passwordHash: passwordData.hash, createdAt: new Date().toISOString() };
        account.users.push(user);
        await writeJsonFile('usuarios.json', account.loginsId, account.users);
        await writeJsonFile(`${user.id}.json`, account.usersId, { userId: user.id, products: [], activities: [], updatedAt: new Date().toISOString() });
      } else if (!user || !(await verifyPassword(password, user.passwordSalt, user.passwordHash))) {
        return send(res, 401, { error: 'E-mail ou senha incorretos.' });
      }
      setCookie(res, signSession(user));
      return send(res, 200, { authenticated: true, user: publicUser(user) });
    }

    if (!session) return send(res, 401, { error: 'Faça login para continuar.' });
    const folders = await ensureFolders();
    const fileName = `${session.sub}.json`;
    const fileId = await findJsonFile(fileName, folders.usersId);

    if (action === 'getInventory') {
      const data = fileId ? await readJsonFile(fileId) : { products: [], activities: [] };
      return send(res, 200, data);
    }

    if (action === 'saveInventory') {
      const products = Array.isArray(body.products) ? body.products : [];
      const activities = Array.isArray(body.activities) ? body.activities : [];
      if (products.length > 5000 || activities.length > 10000) return send(res, 413, { error: 'Limite de registros excedido.' });
      const productIds = products.map((product) => String(product?.id || '').trim().toLocaleLowerCase('pt-BR'));
      if (products.some((product) => !product || typeof product !== 'object' || !String(product.name || '').trim() || !String(product.category || '').trim() || !Number.isInteger(Number(product.quantity)) || Number(product.quantity) < 0 || !Number.isInteger(Number(product.minimum)) || Number(product.minimum) < 0 || !Number.isFinite(Number(product.price)) || Number(product.price) < 0 || !String(product.id || '').trim())) {
        return send(res, 400, { error: 'Revise os dados dos produtos antes de salvar.' });
      }
      if (new Set(productIds).size !== productIds.length) return send(res, 409, { error: 'Existem códigos de produto duplicados.' });
      const safeProducts = products.map((product) => ({
        id: String(product.id || '').trim().slice(0, 30),
        name: String(product.name || '').trim().slice(0, 100),
        sku: String(product.sku || '').trim().slice(0, 30),
        category: String(product.category || '').slice(0, 60),
        quantity: Math.max(0, Math.floor(Number(product.quantity) || 0)),
        minimum: Math.max(0, Math.floor(Number(product.minimum) || 0)),
        price: Math.max(0, Number(product.price) || 0),
        status: Number(product.quantity) <= 0 ? 'Sem estoque' : Number(product.quantity) <= Number(product.minimum) ? 'Estoque baixo' : 'Disponível'
      }));
      const safeActivities = activities.slice(0, 10000).map((activity) => {
        const item = activity && typeof activity === 'object' ? activity : {};
        return {
          id: String(item.id || randomUUID()).slice(0, 80),
          title: String(item.title || '').slice(0, 100),
          detail: String(item.detail || '').slice(0, 240),
          time: String(item.time || '').slice(0, 60),
          type: ['entrada', 'saida', 'ajuste'].includes(item.type) ? item.type : 'ajuste',
          createdAt: item.createdAt && !Number.isNaN(Date.parse(item.createdAt)) ? new Date(item.createdAt).toISOString() : null
        };
      });
      const data = { userId: session.sub, products: safeProducts, activities: safeActivities, updatedAt: new Date().toISOString() };
      await writeJsonFile(fileName, folders.usersId, data);
      return send(res, 200, { success: true, updatedAt: data.updatedAt });
    }

    return send(res, 400, { error: 'Ação desconhecida.' });
  } catch (error) {
    const message = error.message?.includes('Configuração do servidor') ? error.message : 'Não foi possível concluir a operação. Verifique a configuração do Google Drive.';
    return send(res, 500, { error: message });
  }
}
