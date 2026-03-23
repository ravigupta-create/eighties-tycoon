import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// 80s VHS/CRT post-processing shader
const RetroShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    scanlineIntensity: { value: 0.08 },
    vignetteIntensity: { value: 0.3 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float scanlineIntensity;
    uniform float vignetteIntensity;
    varying vec2 vUv;

    void main() {
      // Slight chromatic aberration
      float aberration = 0.001;
      vec4 color;
      color.r = texture2D(tDiffuse, vUv + vec2(aberration, 0.0)).r;
      color.g = texture2D(tDiffuse, vUv).g;
      color.b = texture2D(tDiffuse, vUv - vec2(aberration, 0.0)).b;
      color.a = 1.0;

      // Scanlines
      float scanline = sin(vUv.y * 600.0 + time * 2.0) * scanlineIntensity;
      color.rgb -= scanline;

      // Vignette
      vec2 center = vUv - 0.5;
      float vignette = 1.0 - dot(center, center) * vignetteIntensity * 2.0;
      color.rgb *= vignette;

      // Film grain
      float grain = (fract(sin(dot(vUv * time, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.03;
      color.rgb += grain;

      gl_FragColor = color;
    }
  `,
};

/**
 * Create the post-processing pipeline.
 */
export function createPostProcessing(renderer, scene, camera) {
  const size = renderer.getSize(new THREE.Vector2());
  const composer = new EffectComposer(renderer);

  // Base render
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // Bloom — makes neon signs and lights glow
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(size.x, size.y),
    0.6,   // strength
    0.4,   // radius
    0.85   // threshold
  );
  composer.addPass(bloomPass);

  // Retro CRT shader
  const retroPass = new ShaderPass(RetroShader);
  composer.addPass(retroPass);

  return { composer, retroPass, bloomPass };
}

/**
 * Create the 80s sunset sky.
 */
export function createSky() {
  // Gradient sky using a large sphere with a shader material
  const skyGeo = new THREE.SphereGeometry(400, 32, 32);
  const skyMat = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color('#0a001a') },     // deep space purple
      midColor: { value: new THREE.Color('#4a0060') },     // magenta
      horizonColor: { value: new THREE.Color('#ff4400') },  // orange horizon
      offset: { value: 20 },
      exponent: { value: 0.4 },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 midColor;
      uniform vec3 horizonColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;

      void main() {
        float h = normalize(vWorldPosition + offset).y;

        // Three-band gradient
        vec3 color;
        if (h > 0.3) {
          color = mix(midColor, topColor, (h - 0.3) / 0.7);
        } else if (h > 0.0) {
          color = mix(horizonColor, midColor, h / 0.3);
        } else {
          color = horizonColor;
        }

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    side: THREE.BackSide,
  });

  const sky = new THREE.Mesh(skyGeo, skyMat);
  sky.name = 'sky';

  return sky;
}

/**
 * Create stars.
 */
export function createStars() {
  const count = 2000;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 0.7 + 0.3); // upper hemisphere bias
    const r = 350;

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    sizes[i] = 0.5 + Math.random() * 1.5;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    color: '#ffffff',
    size: 0.8,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8,
  });

  return new THREE.Points(geo, mat);
}

/**
 * Create the dramatic 80s lighting setup.
 */
export function createLighting(scene) {
  // Hemisphere light — purple sky / orange ground
  const hemi = new THREE.HemisphereLight('#4a0080', '#ff6600', 0.4);
  scene.add(hemi);

  // Directional sun — golden hour
  const sun = new THREE.DirectionalLight('#ff8844', 1.2);
  sun.position.set(-50, 30, -30);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 200;
  sun.shadow.camera.left = -80;
  sun.shadow.camera.right = 80;
  sun.shadow.camera.top = 80;
  sun.shadow.camera.bottom = -80;
  scene.add(sun);

  // Ambient fill
  const ambient = new THREE.AmbientLight('#1a1a3a', 0.3);
  scene.add(ambient);

  // Sun sphere (visible in sky)
  const sunGeo = new THREE.SphereGeometry(8, 16, 16);
  const sunMat = new THREE.MeshBasicMaterial({ color: '#ff6600' });
  const sunMesh = new THREE.Mesh(sunGeo, sunMat);
  sunMesh.position.set(-150, 40, -100);
  scene.add(sunMesh);

  return { hemi, sun, ambient, sunMesh };
}
