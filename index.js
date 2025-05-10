// file: index.js
import express from 'express';
import { verifyKey } from 'discord-interactions';
import axios from 'axios';
import 'dotenv/config';

const app = express();
app.use(express.json({ verify: rawBodySaver }));

const PORT = process.env.PORT ?? 3000;
const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;
const N8N_WEBHOOK = process.env.N8N_DISCORD_WEBHOOK;

/**
 * ─────────────────────────────────────────────────────────────
 *  1. Raw-body saver so verifyKey can see the original bytes
 * ─────────────────────────────────────────────────────────────
 */
function rawBodySaver(req, res, buf) {
  if (buf && buf.length) req.rawBody = buf;          // keep a Buffer copy
}

/**
 * ─────────────────────────────────────────────────────────────
 *  2. Single POST route for all Interactions
 * ─────────────────────────────────────────────────────────────
 */
app.post('/', async (req, res) => {
  const sig = req.get('X-Signature-Ed25519');
  const ts = req.get('X-Signature-Timestamp');

  if (!verifyKey(req.rawBody, sig, ts, PUBLIC_KEY)) {
    return res.status(401).send('Bad request signature.');
  }

  // Discord PING opcode = 1
  if (req.body.type === 1) return res.json({ type: 1 });

  // Fire-and-forget to n8n
  axios.post(N8N_WEBHOOK, req.body).catch(console.error);

  // Defer reply so n8n will edit /webhooks/~original later
  res.json({ type: 5 });
});

app.listen(PORT, () => {
  console.log(`✅ discord-bridge running on :${PORT}`);
});
