import { Router } from 'express';
import OpenAI from 'openai';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(__dirname, '..', 'data', 'colors.json');
const router = Router();

function generateViaClaude(prompt) {
  return new Promise((resolve, reject) => {
    const model = process.env.CLAUDE_MODEL || 'haiku';
    const child = spawn('claude', ['-p', '--output-format', 'text', '--model', model, '--max-turns', '1'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, CLAUDECODE: undefined },
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`claude CLI exited with code ${code}: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to spawn claude CLI: ${err.message}`));
    });

    child.stdin.write(prompt);
    child.stdin.end();
  });
}

router.post('/generate', async (req, res) => {
  const { instruction } = req.body;
  if (!instruction) {
    return res.status(400).json({ error: 'instruction is required' });
  }

  const colors = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
  const colorContext = colors.map(c => `${c.name}: ${c.hex}`).join('\n');

  const systemPrompt = `You are a design assistant. You generate beautiful HTML/SVG visual artifacts using a nature-inspired color palette. Output ONLY valid HTML or SVG code, no markdown fences, no explanations. The code should be self-contained and render beautifully.

Available color palette:
${colorContext || 'No colors saved yet.'}`;

  const useClaude = process.env.USE_CLAUDE === 'true';

  logger.info({ instruction, colorCount: colors.length, provider: useClaude ? 'claude' : 'openai' }, 'LLM request: playground generate');

  try {
    let generated;

    if (useClaude) {
      const fullPrompt = `${systemPrompt}\n\nUser request: ${instruction}`;
      generated = await generateViaClaude(fullPrompt);
    } else {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey || apiKey === 'your-api-key-here') {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
      }

      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: instruction },
        ],
        max_tokens: 4096,
      });

      generated = completion.choices[0].message.content;
      logger.info({ usage: completion.usage }, 'OpenAI usage');
    }

    // Strip markdown fences if LLM wraps output in ```html or ```svg
    generated = generated.replace(/^```(?:html|svg|xml)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
    logger.info({ responseLength: generated.length }, 'LLM response received');
    logger.debug({ generatedHtml: generated }, 'LLM response content');

    res.json({ html: generated });
  } catch (err) {
    logger.error({ err: err.message, stack: err.stack }, 'LLM API error');
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

export default router;
