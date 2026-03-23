import * as THREE from 'three';
import { createWindowTexture, createBrickTexture, createConcreteTexture, createNeonTexture } from './textures';

const BUILDING_PALETTES = [
  { wall: '#2a1a3e', accent: '#ff00ff' },  // purple/magenta
  { wall: '#1a2a3e', accent: '#00ffff' },  // dark blue/cyan
  { wall: '#3e1a2a', accent: '#ff3366' },  // maroon/pink
  { wall: '#1a3e2a', accent: '#33ff66' },  // dark green/neon green
  { wall: '#3e3a1a', accent: '#ffb000' },  // olive/amber
  { wall: '#2e1a1a', accent: '#ff4444' },  // dark red/red
  { wall: '#1a1a3e', accent: '#6666ff' },  // navy/blue
  { wall: '#3e2a1a', accent: '#ff8800' },  // brown/orange
];

const NEON_SIGNS = [
  'OPEN 24HRS', 'NEON DREAMS', 'ARCADE', 'COCKTAILS', 'DINER',
  'RECORDS', 'VHS RENTAL', 'DISCO', 'SYNTH CITY', 'MIAMI VICE',
  'LASER TAG', 'ROLLER RINK', 'AEROBICS', 'COMMODORE', 'TYCOON',
  'BAR & GRILL', 'KARATE', 'PIZZA', 'ELECTRONICS', 'FASHION',
];

const NEON_COLORS = ['#ff00ff', '#00ffff', '#ff3366', '#33ff66', '#ffb000', '#ff4444', '#ff8800'];

// Cache materials to reduce draw calls
const materialCache = {};
function getCachedMaterial(key, factory) {
  if (!materialCache[key]) materialCache[key] = factory();
  return materialCache[key];
}

/**
 * Generate a single procedural building.
 * type: 'skyscraper' | 'commercial' | 'house' | 'warehouse'
 */
export function createBuilding(type = 'commercial', seed = 0) {
  const group = new THREE.Group();
  const rng = seededRandom(seed);

  const palette = BUILDING_PALETTES[Math.floor(rng() * BUILDING_PALETTES.length)];

  if (type === 'skyscraper') {
    const floors = 8 + Math.floor(rng() * 15);
    const baseW = 8 + rng() * 6;
    const baseD = 8 + rng() * 6;
    const floorH = 3;
    const totalH = floors * floorH;

    // Main tower
    const windowTex = createWindowTexture(floors, Math.ceil(baseW / 2));
    const mat = new THREE.MeshStandardMaterial({
      map: windowTex,
      roughness: 0.3,
      metalness: 0.6,
      color: new THREE.Color(palette.wall),
    });
    const geo = new THREE.BoxGeometry(baseW, totalH, baseD);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = totalH / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Setback upper section
    if (rng() > 0.4 && floors > 12) {
      const upperH = Math.floor(floors * 0.3) * floorH;
      const upperW = baseW * 0.7;
      const upperD = baseD * 0.7;
      const upperTex = createWindowTexture(Math.floor(floors * 0.3), Math.ceil(upperW / 2));
      const upperMat = new THREE.MeshStandardMaterial({
        map: upperTex, roughness: 0.2, metalness: 0.7, color: new THREE.Color(palette.wall),
      });
      const upperGeo = new THREE.BoxGeometry(upperW, upperH, upperD);
      const upperMesh = new THREE.Mesh(upperGeo, upperMat);
      upperMesh.position.y = totalH + upperH / 2;
      upperMesh.castShadow = true;
      group.add(upperMesh);
    }

    // Rooftop antenna
    if (rng() > 0.5) {
      const antennaGeo = new THREE.CylinderGeometry(0.1, 0.15, 6, 6);
      const antennaMat = getCachedMaterial('antenna', () =>
        new THREE.MeshStandardMaterial({ color: '#888888', metalness: 0.9, roughness: 0.2 })
      );
      const antenna = new THREE.Mesh(antennaGeo, antennaMat);
      antenna.position.y = totalH + 3;
      group.add(antenna);

      // Red blinking light
      const lightGeo = new THREE.SphereGeometry(0.3, 8, 8);
      const lightMat = new THREE.MeshBasicMaterial({ color: '#ff0000' });
      const light = new THREE.Mesh(lightGeo, lightMat);
      light.position.y = totalH + 6;
      light.userData.blink = true;
      group.add(light);
    }

  } else if (type === 'commercial') {
    const floors = 2 + Math.floor(rng() * 5);
    const baseW = 10 + rng() * 8;
    const baseD = 8 + rng() * 5;
    const floorH = 3.5;
    const totalH = floors * floorH;

    const useBrick = rng() > 0.5;
    const tex = useBrick ? createBrickTexture() : createWindowTexture(floors, Math.ceil(baseW / 3));
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: useBrick ? 0.9 : 0.4,
      metalness: useBrick ? 0.1 : 0.5,
      color: useBrick ? '#aa8866' : new THREE.Color(palette.wall),
    });
    const geo = new THREE.BoxGeometry(baseW, totalH, baseD);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = totalH / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Awning
    if (rng() > 0.4) {
      const awningGeo = new THREE.BoxGeometry(baseW + 1, 0.3, 2);
      const awningColors = ['#cc3333', '#3333cc', '#33cc33', '#cc8833', '#cc33cc'];
      const awningMat = new THREE.MeshStandardMaterial({
        color: awningColors[Math.floor(rng() * awningColors.length)],
        roughness: 0.8,
      });
      const awning = new THREE.Mesh(awningGeo, awningMat);
      awning.position.set(0, floorH * 0.85, baseD / 2 + 1);
      group.add(awning);
    }

  } else if (type === 'house') {
    const w = 8 + rng() * 4;
    const d = 8 + rng() * 4;
    const wallH = 4 + rng() * 2;

    // Walls
    const brickTex = createBrickTexture(rng() > 0.5 ? '#8B6914' : '#8B4513');
    const wallMat = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.9 });
    const wallGeo = new THREE.BoxGeometry(w, wallH, d);
    const walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.y = wallH / 2;
    walls.castShadow = true;
    walls.receiveShadow = true;
    group.add(walls);

    // Roof — triangular prism
    const roofH = 3;
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-w / 2 - 0.5, 0);
    roofShape.lineTo(0, roofH);
    roofShape.lineTo(w / 2 + 0.5, 0);
    roofShape.lineTo(-w / 2 - 0.5, 0);
    const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: d + 1, bevelEnabled: false });
    const roofMat = new THREE.MeshStandardMaterial({ color: '#553322', roughness: 0.9 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, wallH, -d / 2 - 0.5);
    roof.castShadow = true;
    group.add(roof);

    // Door
    const doorGeo = new THREE.BoxGeometry(1.2, 2.2, 0.2);
    const doorMat = new THREE.MeshStandardMaterial({ color: '#4a2810', roughness: 0.7 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 1.1, d / 2 + 0.1);
    group.add(door);

    // Windows
    const winGeo = new THREE.BoxGeometry(1.2, 1.2, 0.1);
    const winMat = new THREE.MeshStandardMaterial({ color: '#aaccff', roughness: 0.1, metalness: 0.8, emissive: '#334466', emissiveIntensity: 0.3 });
    [-1.8, 1.8].forEach(xOff => {
      const win = new THREE.Mesh(winGeo, winMat);
      win.position.set(xOff, wallH * 0.6, d / 2 + 0.05);
      group.add(win);
    });

  } else { // warehouse
    const w = 14 + rng() * 8;
    const d = 10 + rng() * 6;
    const h = 6 + rng() * 3;

    const concTex = createConcreteTexture(rng() > 0.5 ? 10 : 0);
    const mat = new THREE.MeshStandardMaterial({ map: concTex, roughness: 0.95, color: '#777777' });
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = h / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Garage door
    const gDoorGeo = new THREE.BoxGeometry(5, 4, 0.2);
    const gDoorMat = new THREE.MeshStandardMaterial({ color: '#555566', metalness: 0.8, roughness: 0.3 });
    const gDoor = new THREE.Mesh(gDoorGeo, gDoorMat);
    gDoor.position.set(0, 2, d / 2 + 0.1);
    group.add(gDoor);
  }

  // Neon sign (most buildings)
  if (type !== 'house' && rng() > 0.3) {
    const signText = NEON_SIGNS[Math.floor(rng() * NEON_SIGNS.length)];
    const signColor = NEON_COLORS[Math.floor(rng() * NEON_COLORS.length)];
    const neonTex = createNeonTexture(signText, signColor);
    const signGeo = new THREE.PlaneGeometry(6, 1);
    const signMat = new THREE.MeshBasicMaterial({ map: neonTex, transparent: true, side: THREE.DoubleSide });
    const sign = new THREE.Mesh(signGeo, signMat);

    const bHeight = type === 'skyscraper' ? 10 + rng() * 5 : 5 + rng() * 3;
    sign.position.set(0, bHeight, (type === 'warehouse' ? 6 : 5) + rng() * 2);
    sign.userData.neonFlicker = true;
    sign.userData.flickerSpeed = 0.5 + rng() * 2;
    group.add(sign);

    // Sign point light
    const signLight = new THREE.PointLight(signColor, 2, 15);
    signLight.position.copy(sign.position);
    signLight.position.z += 1;
    group.add(signLight);
  }

  group.userData.buildingType = type;
  return group;
}

// Simple seeded RNG
function seededRandom(seed) {
  let s = seed || 1;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export { seededRandom };
