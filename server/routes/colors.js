import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { generateDesignSystem, categorizeColor } from '../generateDesignSystem.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(__dirname, '..', 'data', 'colors.json');

function readColors() {
  const raw = fs.readFileSync(dataFile, 'utf-8');
  return JSON.parse(raw);
}

function writeColors(colors) {
  fs.writeFileSync(dataFile, JSON.stringify(colors, null, 2));
  generateDesignSystem(colors);
}

const router = Router();

router.get('/', (req, res) => {
  const colors = readColors();
  let needsWrite = false;
  for (const color of colors) {
    if (!color.category) {
      color.category = categorizeColor(color.hex);
      needsWrite = true;
    }
  }
  if (needsWrite) {
    writeColors(colors);
  }
  res.json(colors);
});

router.post('/', (req, res) => {
  const { name, hex, rgb, sourceImage } = req.body;
  if (!name || !hex) {
    return res.status(400).json({ error: 'name and hex are required' });
  }
  const colors = readColors();
  const color = { id: uuidv4(), name, hex, rgb: rgb || null, sourceImage: sourceImage || null, category: categorizeColor(hex), createdAt: new Date().toISOString() };
  colors.push(color);
  writeColors(colors);
  res.status(201).json(color);
});

router.delete('/:id', (req, res) => {
  let colors = readColors();
  const before = colors.length;
  colors = colors.filter(c => c.id !== req.params.id);
  if (colors.length === before) {
    return res.status(404).json({ error: 'Color not found' });
  }
  writeColors(colors);
  res.json({ success: true });
});

export default router;
