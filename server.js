import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import express from 'express';
import { fileURLToPath, pathToFileURL } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const requiredEnv = [
  'VITE_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'GMAIL_USER',
  'GMAIL_APP_PASSWORD',
];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
const invalidEnv = [];

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const gmailUser = process.env.GMAIL_USER || '';
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD || '';

try {
  const parsedUrl = new URL(supabaseUrl);
  if (parsedUrl.pathname !== '/' && parsedUrl.pathname !== '') {
    invalidEnv.push(
      'VITE_SUPABASE_URL must be the bare Supabase project URL with no path, e.g. https://<project>.supabase.co'
    );
  }
} catch (err) {
  invalidEnv.push('VITE_SUPABASE_URL is not a valid URL.');
}

if (supabaseUrl && supabaseUrl.includes('/dashboard')) {
  invalidEnv.push(
    'VITE_SUPABASE_URL appears to be a Supabase dashboard URL. It should be the project URL like https://<project>.supabase.co'
  );
}

if (
  serviceRoleKey &&
  (serviceRoleKey.includes('your-service-role-key') || serviceRoleKey.startsWith('eyJhbG')) &&
  serviceRoleKey.length < 50
) {
  invalidEnv.push(
    'SUPABASE_SERVICE_ROLE_KEY appears to be a placeholder or invalid value. Use the actual service role key from your Supabase project settings.'
  );
}

if (gmailUser && gmailUser.includes('your_gmail_address')) {
  invalidEnv.push('GMAIL_USER appears to be a placeholder. Set it to a real Gmail address.');
}

if (gmailAppPassword && (gmailAppPassword.includes('your_16_char_app_password') || gmailAppPassword.length !== 16)) {
  invalidEnv.push('GMAIL_APP_PASSWORD appears invalid. Use a 16-character App Password from Google, not your regular Gmail password.');
}

if (missingEnv.length > 0) {
  invalidEnv.unshift(`Missing required environment variables: ${missingEnv.join(', ')}`);
}

if (invalidEnv.length > 0) {
  console.error('Environment validation failed:');
  invalidEnv.forEach((message) => console.error(`- ${message}`));
  console.error('Please fix your .env.local or .env file and restart the server.');
  process.exit(1);
}

const app = express();

app.use(express.json());

const API_DIR = path.join(__dirname, 'api');
const ROUTE_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;

async function loadApiHandler(routeName) {
  if (!ROUTE_NAME_REGEX.test(routeName)) {
    return null;
  }

  const handlerPath = path.join(API_DIR, `${routeName}.js`);
  if (!fs.existsSync(handlerPath)) {
    return null;
  }

  const moduleUrl = `${pathToFileURL(handlerPath).href}?t=${Date.now()}`;
  try {
    const imported = await import(moduleUrl);
    return imported.default;
  } catch (err) {
    console.error(`Failed to load API handler for /api/${routeName}:`, err);
    return { loadError: err };
  }
}

app.all('/api/:route', async (req, res) => {
  const handlerResult = await loadApiHandler(req.params.route);

  if (!handlerResult) {
    return res.status(404).json({ success: false, error: 'API route not found.' });
  }

  if ('loadError' in handlerResult) {
    const error = handlerResult.loadError;
    console.error(`Error importing route /api/${req.params.route}:`, error);
    return res.status(500).json({
      success: false,
      error: 'Failed to load API route. Check server logs for missing environment variables or configuration.',
    });
  }

  try {
    await handlerResult(req, res);
  } catch (err) {
    console.error(`Error in API route /api/${req.params.route}:`, err);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

async function startServer() {
  const port = Number(process.env.PORT || 3000);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: 'ssr' },
      appType: 'custom',
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res) => {
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).send(template);
      } catch (error) {
        vite.ssrFixStacktrace(error);
        console.error(error);
        res.status(500).send(error.message);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.use('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`DentaPlus server listening on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
