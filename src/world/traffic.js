import * as THREE from 'three';
import { BLOCK_SIZE, ROAD_WIDTH, GRID_SIZE, TOTAL_SIZE, createCar } from './city';

const CAR_COUNT = 20;
const CAR_SPEED = 8;

export class TrafficManager {
  constructor(scene) {
    this.scene = scene;
    this.cars = [];
  }

  init() {
    const carColors = ['#cc2222', '#2222cc', '#22cc22', '#cccc22', '#cc22cc', '#ffffff', '#222222', '#ff8800', '#ff69b4', '#00cccc'];

    for (let i = 0; i < CAR_COUNT; i++) {
      const color = carColors[i % carColors.length];
      const car = createCar(color);

      // Pick a random road lane
      const horizontal = Math.random() > 0.5;
      const laneIdx = Math.floor(Math.random() * (GRID_SIZE + 1));
      const lanePos = laneIdx * (BLOCK_SIZE + ROAD_WIDTH) - TOTAL_SIZE / 2;
      const direction = Math.random() > 0.5 ? 1 : -1;
      const offset = direction * 2.5; // offset to right side of road

      const startPos = (Math.random() - 0.5) * TOTAL_SIZE;

      if (horizontal) {
        car.position.set(startPos, 0.01, lanePos + offset);
        car.rotation.y = direction > 0 ? 0 : Math.PI;
      } else {
        car.position.set(lanePos + offset, 0.01, startPos);
        car.rotation.y = direction > 0 ? Math.PI / 2 : -Math.PI / 2;
      }

      car.userData.horizontal = horizontal;
      car.userData.direction = direction;
      car.userData.speed = CAR_SPEED * (0.6 + Math.random() * 0.8);

      this.scene.add(car);
      this.cars.push(car);
    }
  }

  update(dt, playerPos) {
    const halfTotal = TOTAL_SIZE / 2 + 30;

    for (const car of this.cars) {
      const dist = car.position.distanceTo(playerPos);
      if (dist > 250) {
        car.visible = false;
        continue;
      }
      car.visible = true;

      const speed = car.userData.speed * car.userData.direction;

      if (car.userData.horizontal) {
        car.position.x += speed * dt;
        if (car.position.x > halfTotal) car.position.x = -halfTotal;
        if (car.position.x < -halfTotal) car.position.x = halfTotal;
      } else {
        car.position.z += speed * dt;
        if (car.position.z > halfTotal) car.position.z = -halfTotal;
        if (car.position.z < -halfTotal) car.position.z = halfTotal;
      }
    }
  }

  dispose() {
    for (const car of this.cars) {
      this.scene.remove(car);
      car.traverse(c => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
    }
    this.cars = [];
  }
}
