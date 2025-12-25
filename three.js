import './styles.css';
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);

renderer.render(scene, camera);

document.body.appendChild(renderer.domElement);
const geometry = new THREE.BoxGeometry(1, 1, 1);
const texture = new THREE.TextureLoader().load('Frieren.jpeg')
const material = new THREE.MeshBasicMaterial({ map: texture });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const donut_geo = new THREE.TorusGeometry(10, 3, 16, 100);
const donut_texture = new THREE.TextureLoader().load('texture.jpeg');
const donut_tex = new THREE.MeshBasicMaterial({ map: donut_texture });
const donut = new THREE.Mesh(donut_geo, donut_tex);
scene.add(donut);

camera.position.z = 18;

// Shooting stars array
const shootingStars = [];
const comets = [];

// Create a shooting star
function createShootingStar() {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(6); // 2 points for the trail
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8
  });

  const star = new THREE.Line(geometry, material);

  // Random starting position (off-screen top-right)
  star.userData = {
    x: THREE.MathUtils.randFloat(50, 150),
    y: THREE.MathUtils.randFloat(50, 100),
    z: THREE.MathUtils.randFloat(-50, 50),
    speed: THREE.MathUtils.randFloat(1.5, 3),
    length: THREE.MathUtils.randFloat(3, 6)
  };

  scene.add(star);
  return star;
}

// Create a comet (larger, with a glow)
function createComet() {
  const group = new THREE.Group();

  // Comet head
  const headGeo = new THREE.SphereGeometry(0.5, 16, 16);
  const headMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
  const head = new THREE.Mesh(headGeo, headMat);
  group.add(head);

  // Comet tail (multiple fading spheres)
  for (let i = 1; i <= 8; i++) {
    const tailGeo = new THREE.SphereGeometry(0.5 - i * 0.05, 8, 8);
    const tailMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 1 - i * 0.1
    });
    const tail = new THREE.Mesh(tailGeo, tailMat);
    tail.position.set(i * 0.8, i * 0.5, 0);
    group.add(tail);
  }

  // Random starting position
  group.userData = {
    x: THREE.MathUtils.randFloat(80, 150),
    y: THREE.MathUtils.randFloat(30, 80),
    z: THREE.MathUtils.randFloat(-30, 30),
    speed: THREE.MathUtils.randFloat(0.8, 1.5)
  };

  group.position.set(group.userData.x, group.userData.y, group.userData.z);
  scene.add(group);
  return group;
}

// Create initial shooting stars and comets
for (let i = 0; i < 5; i++) {
  shootingStars.push(createShootingStar());
}
for (let i = 0; i < 2; i++) {
  comets.push(createComet());
}

function animate() {
  donut.rotation.x += 0.001;
  donut.rotation.y += 0.001;

  // Animate shooting stars
  shootingStars.forEach(star => {
    const d = star.userData;
    d.x -= d.speed * 1.5;
    d.y -= d.speed;

    // Update line positions (head and tail)
    const positions = star.geometry.attributes.position.array;
    positions[0] = d.x;
    positions[1] = d.y;
    positions[2] = d.z;
    positions[3] = d.x + d.length;
    positions[4] = d.y + d.length * 0.7;
    positions[5] = d.z;
    star.geometry.attributes.position.needsUpdate = true;

    // Reset if off-screen
    if (d.x < -150 || d.y < -100) {
      d.x = THREE.MathUtils.randFloat(50, 150);
      d.y = THREE.MathUtils.randFloat(50, 100);
      d.z = THREE.MathUtils.randFloat(-50, 50);
      d.speed = THREE.MathUtils.randFloat(1.5, 3);
    }
  });

  // Animate comets
  comets.forEach(comet => {
    const d = comet.userData;
    d.x -= d.speed;
    d.y -= d.speed * 0.6;
    comet.position.set(d.x, d.y, d.z);

    // Reset if off-screen
    if (d.x < -150 || d.y < -80) {
      d.x = THREE.MathUtils.randFloat(80, 150);
      d.y = THREE.MathUtils.randFloat(30, 80);
      d.z = THREE.MathUtils.randFloat(-30, 30);
      d.speed = THREE.MathUtils.randFloat(0.8, 1.5);
    }
  });

  renderer.render(scene, camera);
}

function add_star() {
  const star_geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const star_material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(star_geometry, star_material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(200));

  star.position.set(x, y, z);
  scene.add(star);
}

Array(200).fill().forEach(add_star);

camera.position.setZ(45);

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;

  cube.rotation.y += 0.01;
  cube.rotation.z += 0.01;

  camera.position.z = t * -0.01;
  camera.position.x = t * -0.0000;
  camera.rotation.y = t * -0.0000;

}

document.body.onscroll = moveCamera;
moveCamera();

