import * as THREE from 'three';
import { createBuilding, seededRandom } from './buildings';
import { createAsphaltTexture, createGrassTexture, createNeonTexture } from './textures';

const BLOCK_SIZE = 45;
const ROAD_WIDTH = 10;
const GRID_SIZE = 8; // 8x8 blocks = decent city
const TOTAL_SIZE = GRID_SIZE * (BLOCK_SIZE + ROAD_WIDTH);

/**
 * Generate the entire city and return it as a THREE.Group.
 */
export function generateCity() {
  const city = new THREE.Group();
  city.name = 'city';

  // Ground plane
  const groundGeo = new THREE.PlaneGeometry(TOTAL_SIZE * 1.5, TOTAL_SIZE * 1.5);
  const grassTex = createGrassTexture();
  const groundMat = new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.95 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  ground.receiveShadow = true;
  city.add(ground);

  // Roads
  const roadGroup = createRoads();
  city.add(roadGroup);

  // Sidewalks
  const sidewalkGroup = createSidewalks();
  city.add(sidewalkGroup);

  // Buildings in each block
  const rng = seededRandom(1980);
  for (let bx = 0; bx < GRID_SIZE; bx++) {
    for (let bz = 0; bz < GRID_SIZE; bz++) {
      const blockX = bx * (BLOCK_SIZE + ROAD_WIDTH) - TOTAL_SIZE / 2 + BLOCK_SIZE / 2 + ROAD_WIDTH / 2;
      const blockZ = bz * (BLOCK_SIZE + ROAD_WIDTH) - TOTAL_SIZE / 2 + BLOCK_SIZE / 2 + ROAD_WIDTH / 2;

      // Determine district
      const distFromCenter = Math.sqrt(Math.pow(bx - GRID_SIZE / 2, 2) + Math.pow(bz - GRID_SIZE / 2, 2));
      let district;
      if (distFromCenter < 2) district = 'downtown';
      else if (distFromCenter < 3.5) district = 'commercial';
      else if (bx === 0 || bz === 0) district = 'industrial';
      else district = 'suburban';

      const buildingCount = district === 'downtown' ? 2 + Math.floor(rng() * 2) :
        district === 'commercial' ? 1 + Math.floor(rng() * 2) :
          district === 'suburban' ? 1 + Math.floor(rng() * 2) : 1;

      for (let i = 0; i < buildingCount; i++) {
        const type = district === 'downtown' ? (rng() > 0.3 ? 'skyscraper' : 'commercial') :
          district === 'commercial' ? (rng() > 0.6 ? 'skyscraper' : 'commercial') :
            district === 'suburban' ? 'house' : 'warehouse';

        const seed = bx * 1000 + bz * 100 + i;
        const building = createBuilding(type, seed);

        // Position within block
        const margin = 6;
        const ox = (rng() - 0.5) * (BLOCK_SIZE - margin * 2);
        const oz = (rng() - 0.5) * (BLOCK_SIZE - margin * 2);
        building.position.set(blockX + ox, 0, blockZ + oz);
        building.rotation.y = Math.floor(rng() * 4) * Math.PI / 2;

        // Store district info for game integration
        building.userData.district = district;
        building.userData.blockX = bx;
        building.userData.blockZ = bz;

        city.add(building);
      }

      // Street props
      addStreetProps(city, blockX, blockZ, rng, district);
    }
  }

  // ── Landmark buildings (interactive) ──
  addLandmarks(city);

  return city;
}

const LANDMARKS = [
  { type: 'stock_exchange', name: 'WALL STREET',       color: '#00ffff', pos: [15, 0, 15],   tab: 'portfolio' },
  { type: 'real_estate',    name: 'REAL ESTATE CO.',    color: '#33ff66', pos: [-30, 0, 20],  tab: 'realestate' },
  { type: 'luxury_shop',    name: 'LUXURY BOUTIQUE',    color: '#ff00ff', pos: [20, 0, -25],  tab: 'luxury' },
  { type: 'hospital',       name: 'CITY HOSPITAL',      color: '#ff3333', pos: [-25, 0, -30], tab: 'status' },
  { type: 'arcade',         name: 'NEON ARCADE',         color: '#ffb000', pos: [0, 0, -40],  tab: 'status' },
];

function addLandmarks(city) {
  for (const lm of LANDMARKS) {
    const building = createBuilding(lm.type === 'hospital' ? 'commercial' : 'skyscraper', lm.name.length * 100);
    building.position.set(...lm.pos);

    // Big neon sign
    const signTex = createNeonTexture(lm.name, lm.color, 512, 64);
    const signGeo = new THREE.PlaneGeometry(8, 1.2);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex, transparent: true, side: THREE.DoubleSide });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 14, 8);
    building.add(sign);

    // Bright point light
    const light = new THREE.PointLight(lm.color, 5, 30);
    light.position.set(0, 14, 9);
    building.add(light);

    // Interaction marker — glowing ring on ground
    const ringGeo = new THREE.RingGeometry(2.5, 3, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: lm.color, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(0, 0.1, 8);
    ring.userData.pulseRing = true;
    building.add(ring);

    building.userData.interactable = true;
    building.userData.interactType = lm.type;
    building.userData.interactTab = lm.tab;
    building.userData.landmarkName = lm.name;

    city.add(building);
  }
}

export { LANDMARKS };

function createRoads() {
  const group = new THREE.Group();
  const asphaltTex = createAsphaltTexture();

  // Horizontal roads
  for (let i = 0; i <= GRID_SIZE; i++) {
    const z = i * (BLOCK_SIZE + ROAD_WIDTH) - TOTAL_SIZE / 2;
    const geo = new THREE.PlaneGeometry(TOTAL_SIZE, ROAD_WIDTH);
    const mat = new THREE.MeshStandardMaterial({ map: asphaltTex.clone(), roughness: 0.9 });
    mat.map.repeat.set(TOTAL_SIZE / 20, 1);
    const road = new THREE.Mesh(geo, mat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, z);
    road.receiveShadow = true;
    group.add(road);
  }

  // Vertical roads
  for (let i = 0; i <= GRID_SIZE; i++) {
    const x = i * (BLOCK_SIZE + ROAD_WIDTH) - TOTAL_SIZE / 2;
    const geo = new THREE.PlaneGeometry(ROAD_WIDTH, TOTAL_SIZE);
    const mat = new THREE.MeshStandardMaterial({ map: asphaltTex.clone(), roughness: 0.9 });
    mat.map.repeat.set(1, TOTAL_SIZE / 20);
    const road = new THREE.Mesh(geo, mat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(x, 0.02, 0);
    road.receiveShadow = true;
    group.add(road);
  }

  return group;
}

function createSidewalks() {
  const group = new THREE.Group();
  const sidewalkMat = new THREE.MeshStandardMaterial({ color: '#999999', roughness: 0.8 });

  for (let bx = 0; bx < GRID_SIZE; bx++) {
    for (let bz = 0; bz < GRID_SIZE; bz++) {
      const x = bx * (BLOCK_SIZE + ROAD_WIDTH) - TOTAL_SIZE / 2 + BLOCK_SIZE / 2 + ROAD_WIDTH / 2;
      const z = bz * (BLOCK_SIZE + ROAD_WIDTH) - TOTAL_SIZE / 2 + BLOCK_SIZE / 2 + ROAD_WIDTH / 2;

      const sw = 2;
      // Four sidewalk strips around block
      const strips = [
        { pos: [x, 0.05, z - BLOCK_SIZE / 2 - sw / 2], size: [BLOCK_SIZE + sw * 2, 0.15, sw] },
        { pos: [x, 0.05, z + BLOCK_SIZE / 2 + sw / 2], size: [BLOCK_SIZE + sw * 2, 0.15, sw] },
        { pos: [x - BLOCK_SIZE / 2 - sw / 2, 0.05, z], size: [sw, 0.15, BLOCK_SIZE] },
        { pos: [x + BLOCK_SIZE / 2 + sw / 2, 0.05, z], size: [sw, 0.15, BLOCK_SIZE] },
      ];

      for (const s of strips) {
        const geo = new THREE.BoxGeometry(...s.size);
        const mesh = new THREE.Mesh(geo, sidewalkMat);
        mesh.position.set(...s.pos);
        mesh.receiveShadow = true;
        group.add(mesh);
      }
    }
  }

  return group;
}

function addStreetProps(city, blockX, blockZ, rng, district) {
  const lampMat = new THREE.MeshStandardMaterial({ color: '#444444', metalness: 0.8, roughness: 0.3 });
  const lampGlowMat = new THREE.MeshBasicMaterial({ color: '#ffcc66' });

  // Lampposts at corners
  const corners = [
    [blockX - 20, blockZ - 20],
    [blockX + 20, blockZ - 20],
    [blockX - 20, blockZ + 20],
    [blockX + 20, blockZ + 20],
  ];

  for (const [cx, cz] of corners) {
    if (rng() > 0.4) continue;

    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.12, 0.15, 5, 6);
    const pole = new THREE.Mesh(poleGeo, lampMat);
    pole.position.set(cx, 2.5, cz);
    city.add(pole);

    // Lamp head
    const headGeo = new THREE.SphereGeometry(0.4, 8, 8);
    const head = new THREE.Mesh(headGeo, lampGlowMat);
    head.position.set(cx, 5.2, cz);
    city.add(head);

    // Light
    const light = new THREE.PointLight('#ffcc66', 3, 20, 2);
    light.position.set(cx, 5, cz);
    city.add(light);
  }

  // Parked cars along roads
  if (rng() > 0.5) {
    const carColors = ['#cc2222', '#2222cc', '#22cc22', '#cccc22', '#cc22cc', '#ffffff', '#222222'];
    const carColor = carColors[Math.floor(rng() * carColors.length)];
    const car = createCar(carColor);
    const side = rng() > 0.5 ? 1 : -1;
    car.position.set(
      blockX + side * (BLOCK_SIZE / 2 + 3),
      0,
      blockZ + (rng() - 0.5) * BLOCK_SIZE * 0.6
    );
    car.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
    city.add(car);
  }
}

function createCar(color = '#cc2222') {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.3 });

  // Body
  const bodyGeo = new THREE.BoxGeometry(2, 0.8, 4);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.6;
  body.castShadow = true;
  group.add(body);

  // Cabin
  const cabGeo = new THREE.BoxGeometry(1.6, 0.7, 2);
  const cabMat = new THREE.MeshStandardMaterial({ color: '#aaccff', roughness: 0.1, metalness: 0.8 });
  const cab = new THREE.Mesh(cabGeo, cabMat);
  cab.position.set(0, 1.15, -0.3);
  group.add(cab);

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.25, 8);
  const wheelMat = new THREE.MeshStandardMaterial({ color: '#222222', roughness: 0.9 });
  const wheelPositions = [
    [-0.9, 0.3, 1.2], [0.9, 0.3, 1.2],
    [-0.9, 0.3, -1.2], [0.9, 0.3, -1.2],
  ];
  for (const [wx, wy, wz] of wheelPositions) {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.position.set(wx, wy, wz);
    wheel.rotation.z = Math.PI / 2;
    group.add(wheel);
  }

  // Headlights
  const hlGeo = new THREE.SphereGeometry(0.15, 6, 6);
  const hlMat = new THREE.MeshBasicMaterial({ color: '#ffffcc' });
  [-0.6, 0.6].forEach(x => {
    const hl = new THREE.Mesh(hlGeo, hlMat);
    hl.position.set(x, 0.6, 2);
    group.add(hl);
  });

  // Taillights
  const tlMat = new THREE.MeshBasicMaterial({ color: '#ff2222' });
  [-0.6, 0.6].forEach(x => {
    const tl = new THREE.Mesh(hlGeo, tlMat);
    tl.position.set(x, 0.6, -2);
    group.add(tl);
  });

  return group;
}

export { createCar, BLOCK_SIZE, ROAD_WIDTH, GRID_SIZE, TOTAL_SIZE };
