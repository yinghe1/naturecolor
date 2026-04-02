import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
      case gn: h = ((bn - rn) / d + 2) / 6; break;
      case bn: h = ((rn - gn) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function generateDesignSystem(colors) {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const tokens = {
    colors: colors.map(c => {
      const rgb = hexToRgb(c.hex);
      const hsl = hexToHsl(c.hex);
      return {
        name: c.name,
        hex: c.hex,
        rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      };
    }),
  };
  fs.writeFileSync(path.join(distDir, 'naturecolor-tokens.json'), JSON.stringify(tokens, null, 2));

  const cssLines = [':root {'];
  for (const c of colors) {
    cssLines.push(`  --nc-${toSlug(c.name)}: ${c.hex};`);
  }
  cssLines.push('}');
  fs.writeFileSync(path.join(distDir, 'naturecolor.css'), cssLines.join('\n') + '\n');

  const scssLines = [];
  for (const c of colors) {
    scssLines.push(`$nc-${toSlug(c.name)}: ${c.hex};`);
  }
  fs.writeFileSync(path.join(distDir, 'naturecolor.scss'), scssLines.join('\n') + '\n');
}
