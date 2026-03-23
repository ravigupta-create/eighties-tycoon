import * as THREE from 'three';
import { generateCity } from './city';
import { NPCManager } from './npcs';
import { TrafficManager } from './traffic';
import { FirstPersonControls } from './controls';
import { createPostProcessing, createSky, createStars, createLighting } from './effects';
import { createCar } from './city';
import { createNeonTexture } from './textures';

/**
 * Main 3D engine — manages scene, rendering, game loop, and state integration.
 */
export class WorldEngine {
  constructor(container) {
    this.container = container;
    this.running = false;
    this.clock = new THREE.Clock();
    this.animationId = null;
    this.neonObjects = [];
    this.blinkObjects = [];
    this.pulseRings = [];
    this.time = 0;
    this.nearbyLandmark = null;
    this.onInteract = null; // callback set by World3D
    this.playerCar = null;
    this.ownedMarkers = [];
  }

  init() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.9;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2('#0a001a', 0.004);

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 500);
    this.camera.position.set(0, 1.7, 5);

    // Sky
    this.sky = createSky();
    this.scene.add(this.sky);
    this.stars = createStars();
    this.scene.add(this.stars);

    // Lighting
    this.lights = createLighting(this.scene);

    // City
    this.city = generateCity();
    this.scene.add(this.city);

    // Collect animated objects
    this.interactables = [];
    this.city.traverse(child => {
      if (child.userData.neonFlicker) this.neonObjects.push(child);
      if (child.userData.blink) this.blinkObjects.push(child);
      if (child.userData.pulseRing) this.pulseRings.push(child);
      if (child.userData.interactable) this.interactables.push(child);
    });

    // Post-processing
    const pp = createPostProcessing(this.renderer, this.scene, this.camera);
    this.composer = pp.composer;
    this.retroPass = pp.retroPass;

    // Controls
    this.controls = new FirstPersonControls(this.camera, this.renderer.domElement);

    // NPCs
    this.npcManager = new NPCManager(this.scene);
    this.npcManager.init();

    // Traffic
    this.trafficManager = new TrafficManager(this.scene);
    this.trafficManager.init();

    // Interaction key handler
    this._onInteractKey = (e) => {
      if (e.code === 'KeyE' && this.nearbyLandmark && this.onInteract) {
        this.onInteract(this.nearbyLandmark.userData.interactTab);
      }
    };
    document.addEventListener('keydown', this._onInteractKey);

    // Resize handler
    this._onResize = () => {
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      this.composer.setSize(w, h);
    };
    window.addEventListener('resize', this._onResize);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    this.controls.enable();
    this._animate();
  }

  stop() {
    this.running = false;
    this.controls.disable();
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Sync 3D world to game state.
   */
  updateGameState(state) {
    if (!state) return;

    // Player's sports car
    const hasCar = state.luxuryItems?.includes('sportscar');
    if (hasCar && !this.playerCar) {
      this.playerCar = createCar('#ff0000');
      // Make it sleeker
      this.playerCar.scale.set(1.2, 0.9, 1.3);
      this.playerCar.position.set(3, 0, 10);
      this.scene.add(this.playerCar);
    } else if (!hasCar && this.playerCar) {
      this.scene.remove(this.playerCar);
      this.playerCar = null;
    }

    // Owned property markers
    const propTypes = (state.properties || []).map(p => p.propertyId);
    // Simple: mark a few existing buildings
    this._updateOwnedMarkers(propTypes);
  }

  _updateOwnedMarkers(propTypes) {
    // Clear old markers
    for (const m of this.ownedMarkers) this.scene.remove(m);
    this.ownedMarkers = [];

    const markerPositions = {
      studio: [30, 12, 30],
      suburban: [-40, 8, 40],
      penthouse: [15, 30, 15],
    };

    const seen = new Set();
    for (const pid of propTypes) {
      if (seen.has(pid)) continue;
      seen.add(pid);
      const pos = markerPositions[pid];
      if (!pos) continue;

      const tex = createNeonTexture('★ OWNED ★', '#33ff33', 256, 48);
      const geo = new THREE.PlaneGeometry(4, 0.8);
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
      const sign = new THREE.Mesh(geo, mat);
      sign.position.set(...pos);
      sign.position.y += 2;
      this.scene.add(sign);
      this.ownedMarkers.push(sign);

      const light = new THREE.PointLight('#33ff33', 3, 20);
      light.position.set(pos[0], pos[1] + 3, pos[2]);
      this.scene.add(light);
      this.ownedMarkers.push(light);
    }
  }

  _animate() {
    if (!this.running) return;
    this.animationId = requestAnimationFrame(() => this._animate());

    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.time += dt;

    // Update controls
    this.controls.update(dt);

    // Update NPCs
    this.npcManager.update(dt, this.camera.position);

    // Update traffic
    this.trafficManager.update(dt, this.camera.position);

    // Neon flicker
    for (const obj of this.neonObjects) {
      const flicker = Math.sin(this.time * obj.userData.flickerSpeed * 10) > 0 ? 1 :
        (Math.random() > 0.95 ? 0.3 : 1);
      obj.material.opacity = flicker * 0.9;
    }

    // Blink lights
    for (const obj of this.blinkObjects) {
      obj.visible = Math.sin(this.time * 2) > 0;
    }

    // Pulse rings (landmark interaction markers)
    for (const ring of this.pulseRings) {
      ring.material.opacity = 0.3 + Math.sin(this.time * 3) * 0.2;
      ring.rotation.z = this.time * 0.5;
    }

    // Check proximity to interactable landmarks
    this.nearbyLandmark = null;
    for (const bld of this.interactables) {
      const worldPos = new THREE.Vector3();
      bld.getWorldPosition(worldPos);
      const dist = this.camera.position.distanceTo(worldPos);
      if (dist < 18) {
        this.nearbyLandmark = bld;
        break;
      }
    }

    // Move player car to follow (parked near player)
    if (this.playerCar) {
      const camPos = this.camera.position;
      this.playerCar.position.set(camPos.x + 5, 0, camPos.z + 5);
    }

    // Update retro shader time
    this.retroPass.uniforms.time.value = this.time;

    // Render
    this.composer.render();
  }

  getNearbyLandmark() {
    return this.nearbyLandmark;
  }

  dispose() {
    this.stop();
    window.removeEventListener('resize', this._onResize);
    document.removeEventListener('keydown', this._onInteractKey);

    this.npcManager.dispose();
    this.trafficManager.dispose();

    for (const m of this.ownedMarkers) this.scene.remove(m);

    this.scene.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    });

    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }

  getPlayerPosition() {
    return this.camera.position.clone();
  }
}
