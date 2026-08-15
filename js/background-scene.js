// ============================================================
// Site-wide interactive 3D background — persistent across the
// entire page (fixed canvas), reacts to pointer AND scroll,
// not just inside the hero. Lightweight, procedural geometry.
// ============================================================

function initBackgroundScene() {
  const canvas = document.getElementById('site-background-canvas');
  if (!canvas || !window.THREE) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    50, window.innerWidth / window.innerHeight, 0.1, 100
  );
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  function getAccent() {
    return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00C6FF';
  }
  const accentColor = new THREE.Color(getAccent());

  // --- Ribbon ---
  const points = [];
  const segments = 80;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = t * Math.PI * 4;
    points.push(new THREE.Vector3(
      Math.sin(angle) * 1.8, (t - 0.5) * 4.2, Math.cos(angle * 0.7) * 1.2
    ));
  }
  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeo = new THREE.TubeGeometry(curve, isMobile ? 120 : 220, 0.045, 8, false);
  const tubeMat = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.75 });
  const ribbon = new THREE.Mesh(tubeGeo, tubeMat);
  scene.add(ribbon);

  const wireMat = new THREE.MeshBasicMaterial({ color: accentColor, wireframe: true, transparent: true, opacity: 0.1 });
  const wireRibbon = new THREE.Mesh(tubeGeo, wireMat);
  wireRibbon.scale.setScalar(1.4);
  scene.add(wireRibbon);

  // --- Ambient grain particles, spread across a tall scroll range ---
  const particleCount = isMobile ? 140 : 320;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.015, transparent: true, opacity: 0.35 });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // --- Pointer parallax (mouse + touch + device tilt) ---
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  function onPointerMove(x, y) {
    targetX = (x / window.innerWidth - 0.5) * 2;
    targetY = (y / window.innerHeight - 0.5) * 2;
  }
  window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY));
  window.addEventListener('touchmove', (e) => {
    if (e.touches[0]) onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma == null || e.beta == null) return;
    targetX = THREE.MathUtils.clamp(e.gamma / 30, -1, 1);
    targetY = THREE.MathUtils.clamp((e.beta - 45) / 30, -1, 1);
  });

  // --- Scroll reactivity: the whole scene drifts/rotates with scroll ---
  let scrollProgress = 0;
  function onScroll() {
    const max = document.body.scrollHeight - window.innerHeight;
    scrollProgress = max > 0 ? window.scrollY / max : 0;
  }
  window.addEventListener('scroll', onScroll, { passive: true });

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

    const scrollSpin = scrollProgress * Math.PI * 2;

    ribbon.rotation.y = elapsed * 0.15 + currentX * 0.4 + scrollSpin * 0.6;
    ribbon.rotation.x = currentY * 0.25;
    wireRibbon.rotation.y = -elapsed * 0.08 + currentX * 0.2 + scrollSpin * 0.3;
    wireRibbon.rotation.x = currentY * 0.15;

    particles.rotation.y = elapsed * 0.02 + scrollSpin * 0.1;
    particles.position.y = scrollProgress * -1.5;

    camera.position.x = currentX * 0.4;
    camera.position.y = -currentY * 0.3;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(rafId); else animate();
  });

  window.__bgSceneMaterials = [tubeMat, wireMat];
  window.__refreshBgSceneColor = () => {
    const c = new THREE.Color(getAccent());
    window.__bgSceneMaterials.forEach(m => m.color.set(c));
  };
}

document.addEventListener('DOMContentLoaded', initBackgroundScene);
