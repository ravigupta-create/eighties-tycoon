import * as THREE from 'three';

const NPC_COLORS = [
  '#ff69b4', '#00ffff', '#ff4444', '#44ff44', '#ffff00',
  '#ff8800', '#8844ff', '#ff00ff', '#4488ff', '#ff3366',
  '#00ff88', '#ffaa00', '#aa44ff', '#44ffaa', '#ff6644',
];

const SKIN_TONES = ['#f5d0a9', '#d4a574', '#c68642', '#8d5524', '#e8beac'];

const MAX_NPCS = 40;
const WALK_SPEED = 2.5;
const WANDER_RADIUS = 150;

/**
 * Create a single low-poly NPC.
 */
function createNPCModel(seed = 0) {
  const group = new THREE.Group();
  const rng = simpleRng(seed);

  const skinColor = SKIN_TONES[Math.floor(rng() * SKIN_TONES.length)];
  const shirtColor = NPC_COLORS[Math.floor(rng() * NPC_COLORS.length)];
  const pantsColor = rng() > 0.5 ? '#2a2a4a' : '#3a3a2a';
  const height = 0.85 + rng() * 0.3;

  const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.7 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.6 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.8 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.9 });

  // Head
  const headGeo = new THREE.BoxGeometry(0.4, 0.45, 0.4);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 1.55 * height;
  head.castShadow = true;
  group.add(head);

  // Hair
  const hairColor = ['#1a1a1a', '#4a2a0a', '#8a6a2a', '#aa3a0a', '#dda030'][Math.floor(rng() * 5)];
  const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.9 });
  const hairGeo = new THREE.BoxGeometry(0.44, 0.2, 0.44);
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.position.y = 1.72 * height;
  group.add(hair);

  // Sunglasses (30% chance)
  if (rng() > 0.7) {
    const glassGeo = new THREE.BoxGeometry(0.42, 0.1, 0.05);
    const glassMat = new THREE.MeshStandardMaterial({ color: '#111111', metalness: 0.9, roughness: 0.1 });
    const glasses = new THREE.Mesh(glassGeo, glassMat);
    glasses.position.set(0, 1.56 * height, 0.2);
    group.add(glasses);
  }

  // Torso
  const torsoGeo = new THREE.BoxGeometry(0.55, 0.65, 0.35);
  const torso = new THREE.Mesh(torsoGeo, shirtMat);
  torso.position.y = 1.1 * height;
  torso.castShadow = true;
  group.add(torso);

  // Arms
  const armGeo = new THREE.BoxGeometry(0.15, 0.55, 0.15);
  const leftArm = new THREE.Mesh(armGeo, shirtMat);
  leftArm.position.set(-0.35, 1.1 * height, 0);
  leftArm.userData.isArm = true;
  leftArm.userData.side = -1;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, shirtMat);
  rightArm.position.set(0.35, 1.1 * height, 0);
  rightArm.userData.isArm = true;
  rightArm.userData.side = 1;
  group.add(rightArm);

  // Legs
  const legGeo = new THREE.BoxGeometry(0.2, 0.55, 0.2);
  const leftLeg = new THREE.Mesh(legGeo, pantsMat);
  leftLeg.position.set(-0.15, 0.45 * height, 0);
  leftLeg.userData.isLeg = true;
  leftLeg.userData.side = -1;
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, pantsMat);
  rightLeg.position.set(0.15, 0.45 * height, 0);
  rightLeg.userData.isLeg = true;
  rightLeg.userData.side = 1;
  group.add(rightLeg);

  // Shoes
  const shoeGeo = new THREE.BoxGeometry(0.22, 0.12, 0.35);
  const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
  leftShoe.position.set(-0.15, 0.06, 0.05);
  group.add(leftShoe);
  const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
  rightShoe.position.set(0.15, 0.06, 0.05);
  group.add(rightShoe);

  group.scale.setScalar(height);
  return group;
}

/**
 * NPC Manager — handles spawning, movement, animation.
 */
export class NPCManager {
  constructor(scene) {
    this.scene = scene;
    this.npcs = [];
    this.time = 0;
  }

  init() {
    for (let i = 0; i < MAX_NPCS; i++) {
      const model = createNPCModel(i * 7 + 42);
      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * WANDER_RADIUS;

      model.position.set(
        Math.cos(angle) * dist,
        0,
        Math.sin(angle) * dist
      );

      // Walking target
      const target = new THREE.Vector3(
        (Math.random() - 0.5) * WANDER_RADIUS * 2,
        0,
        (Math.random() - 0.5) * WANDER_RADIUS * 2
      );

      model.userData.target = target;
      model.userData.speed = WALK_SPEED * (0.7 + Math.random() * 0.6);
      model.userData.pauseTimer = 0;
      model.userData.walkPhase = Math.random() * Math.PI * 2;

      this.scene.add(model);
      this.npcs.push(model);
    }
  }

  update(dt, playerPos) {
    this.time += dt;

    for (const npc of this.npcs) {
      // Distance check — skip update if too far
      const dist = npc.position.distanceTo(playerPos);
      if (dist > 200) {
        npc.visible = false;
        continue;
      }
      npc.visible = true;

      // Pause behavior
      if (npc.userData.pauseTimer > 0) {
        npc.userData.pauseTimer -= dt;
        continue;
      }

      const target = npc.userData.target;
      const dir = new THREE.Vector3().subVectors(target, npc.position);
      dir.y = 0;
      const distToTarget = dir.length();

      if (distToTarget < 2) {
        // Pick new target
        npc.userData.target = new THREE.Vector3(
          (Math.random() - 0.5) * WANDER_RADIUS * 2,
          0,
          (Math.random() - 0.5) * WANDER_RADIUS * 2
        );
        npc.userData.pauseTimer = 1 + Math.random() * 4;
        continue;
      }

      // Move toward target
      dir.normalize();
      const speed = npc.userData.speed;
      npc.position.x += dir.x * speed * dt;
      npc.position.z += dir.z * speed * dt;

      // Face direction
      npc.rotation.y = Math.atan2(dir.x, dir.z);

      // Walk animation — bob + limb swing
      npc.userData.walkPhase += dt * speed * 3;
      const phase = npc.userData.walkPhase;

      npc.position.y = Math.abs(Math.sin(phase)) * 0.08;

      // Animate limbs
      npc.children.forEach(child => {
        if (child.userData.isArm) {
          child.rotation.x = Math.sin(phase) * 0.4 * child.userData.side;
        }
        if (child.userData.isLeg) {
          child.rotation.x = Math.sin(phase + Math.PI) * 0.35 * child.userData.side;
        }
      });
    }
  }

  dispose() {
    for (const npc of this.npcs) {
      this.scene.remove(npc);
      npc.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    }
    this.npcs = [];
  }
}

function simpleRng(seed) {
  let s = seed || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
