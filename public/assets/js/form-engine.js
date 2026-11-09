import * as THREE from "../vendor/three.module.js";
import { RoomEnvironment } from "../vendor/RoomEnvironment.js";

// Shared physical material renderer. No remote models, tracking or runtime CDN.
export function createFormScene(canvas, options = {}) {
  const mode = options.mode || "hero";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
  } catch {
    canvas.parentElement.classList.add("no-webgl");
    options.onError?.();
    return { update() {}, dispose() {} };
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = mode === "preview" ? 0.9 : 1.3;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.set(0, 0, 8.8);
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, 0.025);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x3a145a, 2));
  const keyLight = new THREE.DirectionalLight(0xf1eaff, 6);
  keyLight.position.set(-3, 4, 6);
  scene.add(keyLight);
  const rim = new THREE.DirectionalLight(0xc9ff55, 4);
  rim.position.set(4, 1, -3);
  scene.add(rim);

  const uniforms = { time: { value: 0 }, energy: { value: 1 } };
  const metal = new THREE.MeshPhysicalMaterial({
    color: 0x8b52ef,
    side: THREE.DoubleSide,
    metalness: 0.88,
    roughness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.13,
    envMapIntensity: 2.1,
  });
  metal.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.time;
    shader.uniforms.uEnergy = uniforms.energy;
    shader.vertexShader =
      "uniform float uTime; uniform float uEnergy;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `
      #include <begin_vertex>
      float wave = sin(position.x * 2.6 + uTime) * cos(position.y * 2.2 - uTime * .7) * sin(position.z * 2. + uTime * .4);
      transformed += normal * wave * .10 * uEnergy;
    `,
    );
  };
  const form = new THREE.Group();
  scene.add(form);
  const knotGeometry = new THREE.TorusKnotGeometry(1.2, 0.49, 220, 36, 2, 3);
  const ringPositions = new Float32Array(
    knotGeometry.attributes.position.count * 3,
  );
  for (let i = 0; i <= 220; i++) {
    const a = (i / 220) * Math.PI * 2;
    for (let j = 0; j <= 36; j++) {
      const b = (j / 36) * Math.PI * 2,
        index = (i * 37 + j) * 3;
      ringPositions[index] = (1.42 + 0.52 * Math.cos(b)) * Math.cos(a);
      ringPositions[index + 1] = (1.42 + 0.52 * Math.cos(b)) * Math.sin(a);
      ringPositions[index + 2] = 0.52 * Math.sin(b);
    }
  }
  const ringTarget = knotGeometry.clone();
  ringTarget.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(ringPositions, 3),
  );
  ringTarget.computeVertexNormals();
  knotGeometry.morphAttributes.position = [
    ringTarget.attributes.position.clone(),
  ];
  knotGeometry.morphAttributes.normal = [ringTarget.attributes.normal.clone()];
  ringTarget.dispose();
  const knot = new THREE.Mesh(knotGeometry, metal);
  form.add(knot);
  const satellites = new THREE.Group();
  const orbGeometry = new THREE.SphereGeometry(1, 24, 20);
  for (let i = 0; i < 5; i++) {
    const orb = new THREE.Mesh(orbGeometry, metal);
    const s = [0.12, 0.18, 0.09, 0.23, 0.08][i];
    orb.scale.setScalar(s);
    satellites.add(orb);
  }
  if (mode === "hero") form.add(satellites);

  // A sliced object is built from actual separate 3D meshes.
  const layers = new THREE.Group();
  const layerMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xd6ff53,
    metalness: 0.15,
    roughness: 0.3,
    clearcoat: 1,
  });
  const ringGeometry = new THREE.TorusGeometry(1, 0.035, 8, 90);
  for (let i = 0; i < 44; i++) {
    const ring = new THREE.Mesh(ringGeometry, layerMaterial);
    ring.rotation.x = Math.PI / 2;
    layers.add(ring);
  }
  layers.visible = false;
  form.add(layers);
  const tagShape = new THREE.Shape();
  const w = 1.5,
    h = 1.05,
    r = 0.38;
  tagShape.moveTo(-w + r, -h);
  tagShape.lineTo(w - r, -h);
  tagShape.quadraticCurveTo(w, -h, w, -h + r);
  tagShape.lineTo(w, h - r);
  tagShape.quadraticCurveTo(w, h, w - r, h);
  tagShape.lineTo(-w + r, h);
  tagShape.quadraticCurveTo(-w, h, -w, h - r);
  tagShape.lineTo(-w, -h + r);
  tagShape.quadraticCurveTo(-w, -h, -w + r, -h);
  const hole = new THREE.Path();
  hole.absarc(-1.03, 0.6, 0.17, 0, Math.PI * 2, true);
  tagShape.holes.push(hole);
  const tagGeometry = new THREE.ExtrudeGeometry(tagShape, {
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.08,
    bevelSegments: 4,
    steps: 1,
    curveSegments: 32,
  });
  tagGeometry.center();
  const tagMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xa38afc,
    metalness: 0.15,
    roughness: 0.25,
    clearcoat: 1,
  });
  const tag = new THREE.Mesh(tagGeometry, tagMaterial);
  tag.visible = mode === "preview";
  form.add(tag);
  // Raised linework makes the sample read as a manufactured part.
  const emblem = new THREE.Group();
  const barGeometry = new THREE.BoxGeometry(0.09, 0.88, 0.07);
  for (let i = 0; i < 4; i++) {
    const bar = new THREE.Mesh(
      barGeometry,
      new THREE.MeshStandardMaterial({ color: 0x251342, roughness: 0.4 }),
    );
    bar.rotation.z = (i * Math.PI) / 4;
    bar.position.set(0.2, 0, 0.2);
    emblem.add(bar);
  }
  tag.add(emblem);
  if (mode === "preview") knot.visible = false;

  let state = {
    progress: 0,
    color: "#a38afc",
    roughness: 0.25,
    paused: false,
    width: 50,
    height: 50,
    thickness: 5,
    model: null,
  };
  let modelMesh = null;
  let pointer = { x: 0, y: 0 },
    rotation = { x: 0, y: 0 },
    morph = 0;
  let dirty = true;
  let visible = true,
    disposed = false,
    raf = 0,
    elapsed = 0,
    lastTime = 0;
  const onPointer = (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = THREE.MathUtils.clamp(
      (e.clientX - rect.left) / rect.width - 0.5,
      -0.5,
      0.5,
    );
    pointer.y = THREE.MathUtils.clamp(
      (e.clientY - rect.top) / rect.height - 0.5,
      -0.5,
      0.5,
    );
  };
  const leave = () => {
    pointer = { x: 0, y: 0 };
  };
  canvas.addEventListener("pointermove", onPointer, { passive: true });
  canvas.addEventListener("pointerleave", leave);
  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    dirty = true;
    camera.aspect = width / height;
    camera.position.z = camera.aspect < 0.85 ? 10.2 : 8.8;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  io.observe(canvas);
  const update = (changes) => {
    dirty = true;
    state = { ...state, ...changes };
    if (changes.color) {
      tagMaterial.color.set(changes.color);
      if (mode === "material") metal.color.set(changes.color);
    }
    if (changes.roughness !== undefined) {
      tagMaterial.roughness = changes.roughness;
      metal.roughness = changes.roughness;
    }
    if ("model" in changes) {
      if (modelMesh) {
        form.remove(modelMesh);
        modelMesh.geometry.dispose();
        modelMesh = null;
      }
      if (changes.model?.positions) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(changes.model.positions, 3),
        );
        geometry.computeVertexNormals();
        geometry.computeBoundingBox();
        const size = new THREE.Vector3();
        geometry.boundingBox.getSize(size);
        geometry.center();
        const scale = 3 / Math.max(size.x, size.y, size.z, 0.001);
        geometry.scale(scale, scale, scale);
        modelMesh = new THREE.Mesh(geometry, tagMaterial);
        form.add(modelMesh);
        tag.visible = false;
      } else tag.visible = mode === "preview";
    }
  };
  const render = (now) => {
    if (disposed) return;
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    if (
      visible &&
      !document.hidden &&
      ((!reduced.matches && !state.paused) || dirty)
    ) {
      const moving = !reduced.matches && !state.paused;
      if (moving) elapsed += dt;
      uniforms.time.value = elapsed * 0.7;
      const t = elapsed;
      rotation.x += ((moving ? pointer.y * 0.45 : 0) - rotation.x) * 0.055;
      rotation.y += ((moving ? pointer.x * 0.65 : 0) - rotation.y) * 0.055;
      form.rotation.set(rotation.x, rotation.y, 0);
      form.position.y = moving ? Math.sin(t * 0.8) * 0.09 : 0;
      knot.rotation.set(
        0.35 + Math.sin(t * 0.22) * 0.16,
        t * 0.11 - 0.45,
        -0.35 + Math.cos(t * 0.17) * 0.13,
      );
      knot.scale.setScalar(1 + Math.sin(t * 0.6) * 0.025);
      const morphTarget = mode === "hero" ? (state.morph ?? 0) : 0;
      if (moving) morph += (morphTarget - morph) * 0.035;
      else if (state.morph !== undefined) morph = morphTarget;
      knot.morphTargetInfluences[0] = morph;
      satellites.children.forEach((orb, i) => {
        const a = i * 1.75 + t * (0.13 + i * 0.018);
        orb.position.set(
          Math.cos(a) * 2.05,
          Math.sin(a * 1.2) * 1.8,
          Math.sin(a) * 0.9,
        );
      });
      if (mode === "story") {
        const p = state.progress;
        const knotScale = THREE.MathUtils.clamp(1 - p * 3.3, 0, 1);
        knot.visible = knotScale > 0.01;
        knot.scale.setScalar(knotScale);
        layers.visible = p > 0.13 && p < 0.84;
        const emerge = THREE.MathUtils.smoothstep(p, 0.12, 0.32);
        const collapse = 1 - THREE.MathUtils.smoothstep(p, 0.65, 0.85);
        layers.scale.setScalar(emerge * collapse);
        layers.rotation.set(0.23, t * 0.08, -0.25);
        layers.children.forEach((ring, i) => {
          const y = (i / 43 - 0.5) * 2;
          const radius =
            0.78 + 0.4 * Math.cos(y * 2.8) + 0.12 * Math.sin(y * 4 + t * 0.3);
          ring.scale.setScalar(radius);
          ring.position.y = y * (1.3 + Math.sin(p * Math.PI) * 0.6);
          ring.position.x =
            Math.sin(y * 3 + p * 5) * 0.25 * Math.sin(p * Math.PI);
        });
        const finish = THREE.MathUtils.smoothstep(p, 0.7, 0.9);
        tag.visible = finish > 0;
        tag.scale.setScalar(finish);
        tag.rotation.set(-0.3, 0.4 + Math.sin(t * 0.3) * 0.2, -0.3);
      }
      if (mode === "preview") {
        const width = Math.max(1, Number(state.width) || 50),
          height = Math.max(1, Number(state.height) || 50),
          thickness = Math.max(1, Number(state.thickness) || 5);
        const max = Math.max(width, height);
        tag.scale.set(
          (width / max) * (2.26 / 3.16),
          height / max,
          Math.min(thickness / 5, 4),
        );
        tag.rotation.set(
          -0.18 + rotation.x,
          0.2 + rotation.y + (state.angle || 0),
          -0.2,
        );
        if (modelMesh) {
          const b = state.model.bbox;
          const sx = width / (b.x || 1),
            sy = height / (b.y || 1),
            sz = thickness / (b.z || 1);
          const largest = Math.max(width, height, thickness);
          const originalMax = Math.max(b.x, b.y, b.z);
          modelMesh.scale.set(
            (sx * originalMax) / largest,
            (sy * originalMax) / largest,
            (sz * originalMax) / largest,
          );
          modelMesh.rotation.set(
            -0.45 + rotation.x,
            0.25 + (state.angle || 0) + rotation.y,
            -0.15,
          );
        }
      }
      renderer.render(scene, camera);
      dirty = false;
    }
    raf = requestAnimationFrame(render);
  };
  const lost = (e) => {
    e.preventDefault();
    canvas.parentElement.classList.add("no-webgl");
  };
  canvas.addEventListener("webglcontextlost", lost);
  resize();
  raf = requestAnimationFrame(render);
  canvas.parentElement.classList.add("scene-ready");
  return {
    update,
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("webglcontextlost", lost);
      const geometries = new Set(),
        materials = new Set();
      scene.traverse((o) => {
        if (o.geometry) geometries.add(o.geometry);
        if (o.material) materials.add(o.material);
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      environment.dispose();
      renderer.dispose();
    },
  };
}
