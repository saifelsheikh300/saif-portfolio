// ============================================================
// Hero 3D scene — a floating, glowing ribbon that reacts to
// pointer movement (mouse + touch) with soft parallax.
// Lightweight geometry — no heavy models, all procedural.
// ============================================================

function initHeroScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || !window.THREE) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    50, window.innerWidth / window.innerHeight, 0.1, 100
  );
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Accent color from CSS variable
  const accentHex = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent').trim() || '#00C6FF';
  const accentColor = new THREE.Color(accentHex);

  // --- The ribbon: a twisted tube, built from a curve ---
  const points = [];
  const segments = 80;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = t * Math.PI * 4;
    points.push(new THREE.Vector3(
      Math.sin(angle) * 1.8,
      (t - 0.5) * 4.2,
      Math.cos(angle * 0.7) * 1.2
    ));
  }
  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeo = new THREE.TubeGeometry(curve, isMobile ? 120 : 220, 0.045, 8, false);
  const tubeMat = new THREE.MeshBasicMaterial({
    color: accentColor,
    transparent: true,
    opacity: 0.85,
  });
  const ribbon = new THREE.Mesh(tubeGeo, tubeMat);
  scene.add(ribbon);

  // Wireframe twin for extra depth
  const wireMat = new THREE.MeshBasicMaterial({
    color: accentColor,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
  });
  const wireRibbon = new THREE.Mesh(tubeGeo, wireMat);
  wireRibbon.scale.setScalar(1.4);
  scene.add(wireRibbon);

  // Ambient particles (frame-grain feel)
  const particleCount = isMobile ? 90 : 220;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.015,
    transparent: true,
    opacity: 0.4,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // --- Pointer parallax ---
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  function onPointerMove(x, y) {
    targetX = (x / window.innerWidth - 0.5) * 2;
    targetY = (y / window.innerHeight - 0.5) * 2;
  }
  window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY));
  window.addEventListener('touchmove', (e) => {
    if (e.touches[0]) onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  // Gentle device-tilt parallax on mobile
  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma == null || e.beta == null) return;
    targetX = THREE.MathUtils.clamp(e.gamma / 30, -1, 1);
    targetY = THREE.MathUtils.clamp((e.beta - 45) / 30, -1, 1);
  });

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  const clock = new THREE.Clock();
  let rafId;

  function animate() {
    rafId = requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    currentX += (targetX - currentX) * 0.04;
    currentY += (targetY - currentY) * 0.04;

    ribbon.rotation.y = elapsed * 0.15 + currentX * 0.4;
    ribbon.rotation.x = currentY * 0.25;
    wireRibbon.rotation.y = -elapsed * 0.08 + currentX * 0.2;
    wireRibbon.rotation.x = currentY * 0.15;

    particles.rotation.y = elapsed * 0.02;

    camera.position.x = currentX * 0.4;
    camera.position.y = -currentY * 0.3;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();

  // Pause rendering when tab is hidden (perf)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      animate();
    }
  });

  // Expose so main.js can update the ribbon color on theme toggle
  window.__heroRibbonMaterials = [tubeMat, wireMat];
}

document.addEventListener('DOMContentLoaded', initHeroScene);
