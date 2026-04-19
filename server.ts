import express from 'express';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import apiRouter from './server/api';
import db, { initDatabase } from './server/database';
import { seedDatabase } from './server/seed';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Initialize DB
  try {
    const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
    if (!tableCheck) {
      console.log('Database tables not found. Initializing and seeding...');
      seedDatabase();
    } else {
      const userCount = db.prepare("SELECT count(*) as count FROM users").get() as {count: number};
      if (userCount.count === 0) {
        console.log('Database is empty. Seeding...');
        seedDatabase();
      }
    }
  } catch (err) {
    console.error('Error checking database:', err);
    // If malformed, we might need to recreate it, but we can't easily do that here if it's already open.
  }

  // --- API ROUTES ---
  app.use('/api', apiRouter);

  // 1. Digital Marketing Audit Tool
  app.post('/api/audit', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      // Ensure protocol
      const targetUrl = url.startsWith('http') ? url : `https://${url}`;
      
      console.log(`Auditing: ${targetUrl}`);
      
      const response = await axios.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; EettiBot/1.0; +http://eetti.tech)'
        },
        timeout: 10000
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Extract Metadata
      const title = $('title').text() || $('meta[property="og:title"]').attr('content') || '';
      const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
      const h1 = $('h1').first().text().trim();
      const canonical = $('link[rel="canonical"]').attr('href');
      const viewport = $('meta[name="viewport"]').attr('content');
      const robots = $('meta[name="robots"]').attr('content');
      
      // Social Links
      const socialLinks: Record<string, string> = {};
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;
        
        if (href.includes('facebook.com') && !href.includes('sharer')) socialLinks.facebook = href;
        if (href.includes('instagram.com')) socialLinks.instagram = href;
        if (href.includes('twitter.com') || href.includes('x.com')) socialLinks.twitter = href;
        if (href.includes('linkedin.com') && !href.includes('share')) socialLinks.linkedin = href;
        if (href.includes('youtube.com')) socialLinks.youtube = href;
        if (href.includes('pinterest.com')) socialLinks.pinterest = href;
      });

      // Image Analysis
      const images = $('img');
      const imagesWithoutAlt = images.filter((_, el) => !$(el).attr('alt')).length;

      // Report Card
      const report = {
        url: targetUrl,
        meta: {
          title: { value: title, status: title.length > 10 && title.length < 70 ? 'good' : 'warning', message: 'Optimal length: 10-70 chars' },
          description: { value: description, status: description.length > 50 && description.length < 160 ? 'good' : 'warning', message: 'Optimal length: 50-160 chars' },
          h1: { value: h1, status: h1 ? 'good' : 'error', message: 'H1 tag is crucial for SEO' },
          viewport: { value: viewport ? 'Present' : 'Missing', status: viewport ? 'good' : 'error', message: 'Mobile responsiveness requires viewport tag' },
          robots: { value: robots || 'Not specified', status: 'info', message: 'Directives for crawlers' },
          canonical: { value: canonical || 'Missing', status: canonical ? 'good' : 'warning', message: 'Prevents duplicate content issues' }
        },
        social: {
          found: Object.keys(socialLinks),
          links: socialLinks
        },
        content: {
          imagesTotal: images.length,
          imagesMissingAlt: imagesWithoutAlt,
          status: imagesWithoutAlt === 0 ? 'good' : 'warning',
          message: `${imagesWithoutAlt} images missing alt text`
        },
        performance: {
          loadTime: 'Not measured (requires browser)', 
          ssl: targetUrl.startsWith('https') ? 'Secure' : 'Insecure'
        }
      };

      res.json(report);
    } catch (error: any) {
      console.error('Audit Error:', error.message);
      res.status(500).json({ 
        error: 'Failed to audit URL', 
        details: error.message,
        suggestion: 'Ensure the URL is publicly accessible and valid.'
      });
    }
  });

  // 2. Mock API for OAuth Connectors (Simulated)
  app.get('/api/marketing/connect/:platform', (req, res) => {
    // In a real app, this would redirect to OAuth provider
    // Here we simulate a successful connection flow
    const { platform } = req.params;
    res.json({ 
      url: `https://${platform}.com/oauth/authorize?client_id=MOCK_ID&redirect_uri=http://localhost:3000/callback`,
      status: 'mock_url_generated'
    });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
