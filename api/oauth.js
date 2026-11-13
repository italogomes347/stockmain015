import { randomBytes, timingSafeEqual } from 'node:crypto';
import { google } from 'googleapis';

const STATE_COOKIE = 'stockmain_google_oauth_state';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';

function sendHtml(res, status, html) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; form-action 'none'; base-uri 'none'; frame-ancestors 'none'");
  res.end(html);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function getRedirectUri(req) {
  const configured = process.env.GOOGLE_OAUTH_REDIRECT_URI;
  if (configured) return configured;
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim().toLowerCase();
  const allowed = new Set(['stockmain015.vercel.app', 'stockmain015-gomess.vercel.app', 'localhost:3000', 'localhost:5173']);
  if (!allowed.has(host)) throw new Error('Host não autorizado para OAuth.');
  const proto = host.startsWith('localhost:') ? 'http' : 'https';
  return `${proto}://${host}/api/oauth`;
}

function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').map((part) => {
    const index = part.indexOf('=');
    return index < 0 ? ['', ''] : [part.slice(0, index).trim(), part.slice(index + 1).trim()];
  }).filter(([key]) => key));
}

function equalSecret(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  return left.length === right.length && left.length > 0 && timingSafeEqual(left, right);
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return sendHtml(res, 405, '<h1>Método não permitido</h1>');
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return sendHtml(res, 503, '<h1>OAuth ainda não configurado</h1><p>Adicione GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET nas variáveis de ambiente da Vercel.</p>');
    }

    const redirectUri = getRedirectUri(req);
    const oauth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const url = new URL(req.url, `https://${req.headers.host || 'stockmain015.vercel.app'}`);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) {
      const stateValue = randomBytes(32).toString('hex');
      res.setHeader('Set-Cookie', `${STATE_COOKIE}=${stateValue}; HttpOnly; Secure; SameSite=Lax; Path=/api/oauth; Max-Age=600`);
      const authorizationUrl = oauth.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        include_granted_scopes: true,
        scope: [DRIVE_SCOPE],
        state: stateValue
      });
      res.statusCode = 302;
      res.setHeader('Location', authorizationUrl);
      res.setHeader('Cache-Control', 'no-store');
      return res.end();
    }

    const cookieState = parseCookies(req)[STATE_COOKIE];
    res.setHeader('Set-Cookie', `${STATE_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/api/oauth; Max-Age=0`);
    if (!equalSecret(state, cookieState)) {
      return sendHtml(res, 400, '<h1>Autorização inválida</h1><p>O estado de segurança não corresponde. Inicie a autorização novamente.</p>');
    }

    const { tokens } = await oauth.getToken(code);
    if (!tokens.refresh_token) {
      return sendHtml(res, 400, '<h1>Token de atualização não recebido</h1><p>Revogue o acesso anterior do StockMain na sua Conta Google e inicie novamente com consentimento.</p>');
    }

    const token = escapeHtml(tokens.refresh_token);
    return sendHtml(res, 200, `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Autorização StockMain</title><body style="font:16px system-ui;max-width:760px;margin:48px auto;padding:0 20px;line-height:1.5"><h1>Google Drive autorizado</h1><p>A autorização foi concluída. Copie o token abaixo e cadastre-o na Vercel como variável sensível <strong>GOOGLE_REFRESH_TOKEN</strong> para Production, Preview e Development.</p><textarea readonly style="box-sizing:border-box;width:100%;min-height:130px;padding:12px">${token}</textarea><p>Selecione o token inteiro e copie. A página não envia o token a nenhum outro serviço.</p><p>Não compartilhe este token. Depois de cadastrá-lo na Vercel, remova esta página do histórico e não o envie em conversas.</p></body></html>`);
  } catch (error) {
    console.error('[StockMain OAuth] Authorization failed', {
      code: error?.code ?? null,
      status: error?.response?.status ?? error?.status ?? null,
      message: String(error?.message || 'Unknown error').slice(0, 200)
    });
    return sendHtml(res, 500, '<h1>Não foi possível concluir a autorização</h1><p>Confira a configuração OAuth e tente novamente.</p>');
  }
}
