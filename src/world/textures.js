import * as THREE from 'three';

// Procedural texture factory — all textures generated via canvas, zero external files

export function createBrickTexture(baseColor = '#8B4513', w = 256, h = 256) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#4a3728';
  ctx.fillRect(0, 0, w, h);

  const brickW = 32, brickH = 16, mortarW = 2;
  for (let y = 0; y < h; y += brickH) {
    const offset = (Math.floor(y / brickH) % 2) * (brickW / 2);
    for (let x = -brickW; x < w + brickW; x += brickW) {
      const r = Math.random() * 30 - 15;
      const g = Math.random() * 20 - 10;
      ctx.fillStyle = `hsl(${15 + r}, ${50 + g}%, ${30 + Math.random() * 15}%)`;
      ctx.fillRect(x + offset + mortarW, y + mortarW, brickW - mortarW * 2, brickH - mortarW * 2);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createWindowTexture(floors = 8, cols = 6, w = 256, h = 512) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');

  // Dark facade
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, w, h);

  const winW = (w / cols) * 0.6;
  const winH = (h / floors) * 0.5;
  const gapX = w / cols;
  const gapY = h / floors;

  for (let row = 0; row < floors; row++) {
    for (let col = 0; col < cols; col++) {
      const lit = Math.random() > 0.35;
      const x = col * gapX + (gapX - winW) / 2;
      const y = row * gapY + (gapY - winH) / 2;

      if (lit) {
        const colors = ['#ffb000', '#ff8c00', '#00ffff', '#ffff66', '#ffffff', '#ff69b4'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        // Glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.7 + Math.random() * 0.3;
        ctx.fillRect(x, y, winW, winH);
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(x, y, winW, winH);
        // Faint reflection
        ctx.fillStyle = 'rgba(100,100,150,0.15)';
        ctx.fillRect(x, y, winW, winH * 0.3);
      }
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createConcreteTexture(hue = 0, w = 128, h = 128) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const imgData = ctx.createImageData(w, h);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const v = 140 + Math.random() * 40;
    imgData.data[i] = v + hue;
    imgData.data[i + 1] = v;
    imgData.data[i + 2] = v + (hue > 0 ? 0 : 10);
    imgData.data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createAsphaltTexture(w = 256, h = 256) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const imgData = ctx.createImageData(w, h);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const v = 35 + Math.random() * 20;
    imgData.data[i] = v;
    imgData.data[i + 1] = v;
    imgData.data[i + 2] = v + 5;
    imgData.data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
  // Lane markings
  ctx.strokeStyle = '#cccc44';
  ctx.lineWidth = 3;
  ctx.setLineDash([20, 20]);
  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createGrassTexture(w = 128, h = 128) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const imgData = ctx.createImageData(w, h);
  for (let i = 0; i < imgData.data.length; i += 4) {
    imgData.data[i] = 20 + Math.random() * 30;
    imgData.data[i + 1] = 80 + Math.random() * 60;
    imgData.data[i + 2] = 15 + Math.random() * 20;
    imgData.data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 10);
  return tex;
}

export function createNeonTexture(text, color = '#ff00ff', w = 512, h = 64) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  ctx.font = 'bold 36px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Glow layers
  for (let i = 3; i >= 0; i--) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 10 + i * 8;
    ctx.fillStyle = i === 0 ? '#ffffff' : color;
    ctx.globalAlpha = i === 0 ? 1 : 0.3;
    ctx.fillText(text, w / 2, h / 2);
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  const tex = new THREE.CanvasTexture(c);
  return tex;
}
