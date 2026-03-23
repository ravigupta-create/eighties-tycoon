import * as THREE from 'three';

const MOVE_SPEED = 10;
const SPRINT_MULTIPLIER = 2;
const MOUSE_SENSITIVITY = 0.002;
const PLAYER_HEIGHT = 1.7;
const COLLISION_RADIUS = 0.5;

/**
 * First-person controls with WASD + mouse look + collision.
 */
export class FirstPersonControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.enabled = false;

    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.sprint = false;
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    // Collision
    this.raycaster = new THREE.Raycaster();
    this.collisionObjects = [];

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onPointerLockChange = this._onPointerLockChange.bind(this);

    this.camera.position.y = PLAYER_HEIGHT;
  }

  enable() {
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('pointerlockchange', this._onPointerLockChange);
    this.enabled = true;
  }

  disable() {
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('pointerlockchange', this._onPointerLockChange);
    this.moveForward = this.moveBackward = this.moveLeft = this.moveRight = this.sprint = false;
    this.enabled = false;
    if (document.pointerLockElement) document.exitPointerLock();
  }

  requestPointerLock() {
    this.domElement.requestPointerLock();
  }

  isLocked() {
    return document.pointerLockElement === this.domElement;
  }

  setCollisionObjects(objects) {
    this.collisionObjects = objects;
  }

  update(dt) {
    if (!this.enabled) return;

    const speed = MOVE_SPEED * (this.sprint ? SPRINT_MULTIPLIER : 1);

    // Damping
    this.velocity.x -= this.velocity.x * 8 * dt;
    this.velocity.z -= this.velocity.z * 8 * dt;

    // Direction
    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
    this.direction.normalize();

    if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * speed * dt;
    if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * speed * dt;

    // Apply movement in camera's local space
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const moveX = forward.x * -this.velocity.z + right.x * -this.velocity.x;
    const moveZ = forward.z * -this.velocity.z + right.z * -this.velocity.x;

    // Simple collision check
    const newPos = this.camera.position.clone();
    newPos.x += moveX * dt;
    newPos.z += moveZ * dt;

    if (!this._checkCollision(newPos)) {
      this.camera.position.x = newPos.x;
      this.camera.position.z = newPos.z;
    }

    this.camera.position.y = PLAYER_HEIGHT;
  }

  _checkCollision(pos) {
    // Simple bounding box check against buildings
    for (const obj of this.collisionObjects) {
      if (!obj.geometry) continue;
      obj.geometry.computeBoundingBox();
      const box = obj.geometry.boundingBox.clone();
      box.applyMatrix4(obj.matrixWorld);
      box.expandByScalar(COLLISION_RADIUS);

      if (pos.x > box.min.x && pos.x < box.max.x &&
        pos.z > box.min.z && pos.z < box.max.z &&
        pos.y < box.max.y) {
        return true;
      }
    }
    return false;
  }

  getPosition() {
    return this.camera.position.clone();
  }

  _onKeyDown(e) {
    if (!this.enabled) return;
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': this.moveForward = true; break;
      case 'KeyS': case 'ArrowDown': this.moveBackward = true; break;
      case 'KeyA': case 'ArrowLeft': this.moveLeft = true; break;
      case 'KeyD': case 'ArrowRight': this.moveRight = true; break;
      case 'ShiftLeft': case 'ShiftRight': this.sprint = true; break;
    }
  }

  _onKeyUp(e) {
    if (!this.enabled) return;
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': this.moveForward = false; break;
      case 'KeyS': case 'ArrowDown': this.moveBackward = false; break;
      case 'KeyA': case 'ArrowLeft': this.moveLeft = false; break;
      case 'KeyD': case 'ArrowRight': this.moveRight = false; break;
      case 'ShiftLeft': case 'ShiftRight': this.sprint = false; break;
    }
  }

  _onMouseMove(e) {
    if (!this.enabled || !this.isLocked()) return;

    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= e.movementX * MOUSE_SENSITIVITY;
    this.euler.x -= e.movementY * MOUSE_SENSITIVITY;
    this.euler.x = Math.max(-Math.PI / 2 * 0.9, Math.min(Math.PI / 2 * 0.9, this.euler.x));
    this.camera.quaternion.setFromEuler(this.euler);
  }

  _onPointerLockChange() {
    // No-op for now, could show/hide cursor UI
  }
}
