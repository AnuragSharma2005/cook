import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', brand: 'Cook With Kaju' });
  });

  // Example API for Contact Form (would normally connect to Google Apps Script or Email service)
  app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    console.log('Contact form submission:', { name, email, message });
    // In a real app, you'd call fetch(APPS_SCRIPT_URL) here
    res.json({ success: true, message: 'Message sent successfully!' });
  });

  app.post('/api/collab', async (req, res) => {
    const { brandName, contactPerson, email, budget, message } = req.body;
    console.log('Collab request:', { brandName, contactPerson, email, budget, message });
    res.json({ success: true, message: 'Collaboration request submitted!' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cook With Kaju server running on http://localhost:${PORT}`);
  });
}

startServer();
