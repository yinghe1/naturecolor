import { Router } from 'express';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(__dirname, '..', 'data', 'colors.json');
const router = Router();

router.post('/generate', async (req, res) => {
  const { instruction } = req.body;
  if (!instruction) {
    return res.status(400).json({ error: 'instruction is required' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  const colors = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
  const colorContext = colors.map(c => `${c.name}: ${c.hex}`).join('\n');

  const openai = new OpenAI({ apiKey });

  const messages = [
    {
      role: 'system',
      content: `You are a design assistant. You generate beautiful HTML/SVG visual artifacts using a nature-inspired color palette. Output ONLY valid HTML or SVG code, no markdown fences, no explanations. The code should be self-contained and render beautifully.

Available color palette:
${colorContext || 'No colors saved yet.'}`,
    },
    { role: 'user', content: instruction },
  ];

  logger.info({ instruction, colorCount: colors.length }, 'LLM request: playground generate');

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 4096,
    });

    let generated = completion.choices[0].message.content;
    // Strip markdown fences if LLM wraps output in ```html or ```svg
    generated = generated.replace(/^```(?:html|svg|xml)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
    logger.info(
      { usage: completion.usage, responseLength: generated.length },
      'LLM response received'
    );
    logger.debug({ generatedHtml: generated }, 'LLM response content');

    res.json({ html: generated });
  } catch (err) {
    logger.error({ err: err.message, stack: err.stack }, 'OpenAI API error');
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

export default router;
