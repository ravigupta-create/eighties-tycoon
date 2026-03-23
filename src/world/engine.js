import * as THREE from 'three';
import { generateCity } from './city';
import { NPCManager } from './npcs';
import { FirstPersonControls } from './controls';
import { createPostProcessing, createSky, createStars, createLighting } from './effects';

/**
 * Main 3D engine — manages scene, rendering, and game loop.
 */
export class WorldEngine {
  constructor(container) {
    this.container = container;
    this.running = false;
    this.clock = new THREE.Clock();
    this.animationId = null;
    this.neonObjects = [];
    this.blinkObjects = [];
    this.time = 0;
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

    // Collect neon flicker objects and blink objects
    this.city.traverse(child => {
      if (child.userData.neonFlicker) this.neonObjects.push(child);
      if (child.userData.blink) this.blinkObjects.push(child);
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

  _animate() {
    if (!this.running) return;
    this.animationId = requestAnimationFrame(() => this._animate());

    const dt = Math.min(this.clock.getDelta(), 0.05); // cap dt
    this.time += dt;

    // Update controls
    this.controls.update(dt);

    // Update NPCs
    this.npcManager.update(dt, this.camera.position);

    // Neon flicker
    for (const obj of this.neonObjects) {
      const flicker = Math.sin(this.time * obj.userData.flickerSpeed * 10) > 0 ? 1 :
        (Math.random() > 0.95 ? 0.3 : 1);
      obj.material.opacity = flicker * 0.9;
    }

    // Blink lights (rooftop)
    for (const obj of this.blinkObjects) {
      obj.visible = Math.sin(this.time * 2) > 0;
    }

    // Update retro shader time
    this.retroPass.uniforms.time.value = this.time;

    // Render
    this.composer.render();
  }

  dispose() {
    this.stop();
    window.removeEventListener('resize', this._onResize);

    this.npcManager.dispose();

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
