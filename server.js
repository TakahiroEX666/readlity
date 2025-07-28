import express from 'express';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

const app = express();

app.get('/parse', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing ?url=' });

  try {
    const html = await fetch(url).then(r => r.text());
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) return res.status(500).json({ error: 'Failed to extract content' });

    res.json({
      title: article.title,
      content: article.textContent,
      byline: article.byline,
      length: article.length,
      excerpt: article.excerpt,
      siteName: article.siteName
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching or parsing', details: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Readability API is working. Use /parse?url=https://...');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready on port ${PORT}`));
