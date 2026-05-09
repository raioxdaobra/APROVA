/**
 * Transcreve audio .ogg via Groq Whisper (free tier rapido).
 */
import { config } from 'dotenv';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });

const file = process.argv[2];
if (!file) {
  console.error('Uso: tsx transcribe-audio.ts <arquivo>');
  process.exit(1);
}

(async () => {
  const apiKey = process.env.GROQ_API_KEY!;
  if (!apiKey) {
    console.error('GROQ_API_KEY ausente');
    process.exit(1);
  }
  const audioBuffer = readFileSync(file);
  const blob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/ogg' });
  const formData = new FormData();
  formData.append('file', blob, basename(file));
  formData.append('model', 'whisper-large-v3');
  formData.append('language', 'pt');
  formData.append('response_format', 'text');

  try {
    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    });
    const txt = await res.text();
    if (!res.ok) {
      console.error('FAIL:', res.status, txt.slice(0, 300));
      process.exit(1);
    }
    console.log('=== ' + basename(file) + ' ===');
    console.log(txt);
  } catch (e: any) {
    console.error('FAIL:', e.message?.slice(0, 200));
    process.exit(1);
  }
})();
