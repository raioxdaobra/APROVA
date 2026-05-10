/**
 * Testa cada provider multimodal individualmente pra ver qual funciona.
 */
import { config } from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
config({ path: join(ROOT, '.env.local') });

const TEST_IMAGE_URL =
  'https://udajthekofnfewuxxdcq.supabase.co/storage/v1/object/public/questions/linguagens/2024.2/Q59.jpg';
const TEST_PROMPT =
  'Descreva o que voce ve na imagem em uma frase curta. Em portugues.';

async function fetchImage() {
  console.log('Baixando imagem...');
  const res = await fetch(TEST_IMAGE_URL);
  if (!res.ok) throw new Error(`status ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const mimeType = res.headers.get('content-type') ?? 'image/jpeg';
  console.log(`  ✓ ${buffer.length} bytes, ${mimeType}\n`);
  return { data: buffer.toString('base64'), mimeType };
}

async function testGemini(image: { data: string; mimeType: string }) {
  console.log('────── GEMINI 2.5 FLASH ──────');
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('  ✗ sem GEMINI_API_KEY\n');
    return;
  }
  try {
    const mod = await import('@google/generative-ai');
    const genAI = new mod.GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent([
      { inlineData: { data: image.data, mimeType: image.mimeType } },
      { text: TEST_PROMPT },
    ]);
    console.log('  ✓ ', result.response.text().slice(0, 200));
  } catch (err) {
    console.log('  ✗ ', ((err as Error).message ?? String(err)).slice(0, 300));
  }
  console.log();
}

async function testGroq(image: { data: string; mimeType: string }) {
  console.log('────── GROQ MULTIMODAL ──────');
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.log('  ✗ sem GROQ_API_KEY\n');
    return;
  }
  const dataUrl = `data:${image.mimeType};base64,${image.data}`;
  const models = [
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'meta-llama/llama-4-maverick-17b-128e-instruct',
    'llama-3.2-90b-vision-preview',
    'llama-3.2-11b-vision-preview',
  ];
  for (const model of models) {
    process.stdout.write(`  ${model}: `);
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: TEST_PROMPT },
                { type: 'image_url', image_url: { url: dataUrl } },
              ],
            },
          ],
          max_tokens: 200,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.log(`✗ ${res.status} ${errText.slice(0, 150)}`);
        continue;
      }
      const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      console.log('✓', json.choices?.[0]?.message?.content?.slice(0, 150));
      return; // sucesso, encerra
    } catch (err) {
      console.log(`✗ ${((err as Error).message ?? String(err)).slice(0, 150)}`);
    }
  }
  console.log();
}

async function testMistral(image: { data: string; mimeType: string }) {
  console.log('────── MISTRAL PIXTRAL ──────');
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    console.log('  ✗ sem MISTRAL_API_KEY\n');
    return;
  }
  const dataUrl = `data:${image.mimeType};base64,${image.data}`;
  const models = ['pixtral-12b-2409', 'pixtral-large-latest'];
  for (const model of models) {
    process.stdout.write(`  ${model}: `);
    try {
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: TEST_PROMPT },
                { type: 'image_url', image_url: dataUrl },
              ],
            },
          ],
          max_tokens: 200,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.log(`✗ ${res.status} ${errText.slice(0, 150)}`);
        continue;
      }
      const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      console.log('✓', json.choices?.[0]?.message?.content?.slice(0, 150));
      return;
    } catch (err) {
      console.log(`✗ ${((err as Error).message ?? String(err)).slice(0, 150)}`);
    }
  }
  console.log();
}

async function main() {
  const image = await fetchImage();
  await testGemini(image);
  await testGroq(image);
  await testMistral(image);
}

main().catch((e) => { console.error(e); process.exit(1); });
