import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(__dirname, '..', 'data', 'artifacts.json');

function readArtifacts() {
  return JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
}

function writeArtifacts(artifacts) {
  fs.writeFileSync(dataFile, JSON.stringify(artifacts, null, 2));
}

const router = Router();

router.get('/', (req, res) => {
  res.json(readArtifacts());
});

router.post('/', (req, res) => {
  const { name, html, instruction } = req.body;
  if (!name || !html) {
    return res.status(400).json({ error: 'name and html are required' });
  }
  const artifacts = readArtifacts();
  const artifact = {
    id: uuidv4(),
    name,
    html,
    instruction: instruction || null,
    createdAt: new Date().toISOString(),
  };
  artifacts.push(artifact);
  writeArtifacts(artifacts);
  logger.info({ id: artifact.id, name }, 'Artifact saved');
  res.status(201).json(artifact);
});

router.get('/:id', (req, res) => {
  const artifacts = readArtifacts();
  const artifact = artifacts.find(a => a.id === req.params.id);
  if (!artifact) {
    return res.status(404).json({ error: 'Artifact not found' });
  }
  res.json(artifact);
});

// Serve raw HTML for embedding via iframe
router.get('/:id/embed', (req, res) => {
  const artifacts = readArtifacts();
  const artifact = artifacts.find(a => a.id === req.params.id);
  if (!artifact) {
    return res.status(404).send('Not found');
  }
  res.type('html').send(artifact.html);
});

router.delete('/:id', (req, res) => {
  let artifacts = readArtifacts();
  const before = artifacts.length;
  artifacts = artifacts.filter(a => a.id !== req.params.id);
  if (artifacts.length === before) {
    return res.status(404).json({ error: 'Artifact not found' });
  }
  writeArtifacts(artifacts);
  res.json({ success: true });
});

export default router;
