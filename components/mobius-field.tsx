"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry.js";

export function MobiusField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.16, 8.8);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;

    const environment = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environmentMap = pmrem.fromScene(environment, 0.04).texture;
    scene.environment = environmentMap;

    const geometry = new ParametricGeometry((u, v, target) => {
      const angle = u * Math.PI * 2;
      const width = (v - 0.5) * 1.3;
      const radius = 2.12;
      const twist = angle / 2;

      target.set(
        (radius + width * Math.cos(twist)) * Math.cos(angle),
        width * Math.sin(twist),
        (radius + width * Math.cos(twist)) * Math.sin(angle),
      );
    }, 240, 32);

    const basePositions = geometry.attributes.position.array.slice();
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xe8e8ed,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 2.85,
      metalness: 1,
      roughness: 0.095,
      side: THREE.DoubleSide,
    });
    const nightMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x17191e,
      clearcoat: 1,
      clearcoatRoughness: 0.16,
      envMapIntensity: 1.45,
      metalness: 1,
      roughness: 0.2,
      side: THREE.DoubleSide,
    });
    const ring: THREE.Mesh<THREE.BufferGeometry, THREE.Material> = new THREE.Mesh(geometry, material);
    ring.rotation.set(-0.52, 0.2, -0.08);
    scene.add(ring);

    const knotGeometry = new THREE.TorusKnotGeometry(1.55, 0.022, 280, 10, 2, 3);
    const knotMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x454545,
      envMapIntensity: 2.1,
      metalness: 1,
      opacity: 0.3,
      roughness: 0.12,
      transparent: true,
    });
    const topologyThread = new THREE.Mesh(knotGeometry, knotMaterial);
    topologyThread.position.set(0, 0.08, -1.28);
    topologyThread.rotation.set(0.55, -0.12, 0.08);
    scene.add(topologyThread);

    const applyTheme = () => {
      ring.material = document.documentElement.dataset.theme === "night" ? nightMaterial : material;
    };
    const themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    applyTheme();

    const key = new THREE.SpotLight(0xffffff, 92, 24, Math.PI / 4.5, 0.72, 1.4);
    key.position.set(-2.8, 4.6, 7.2);
    scene.add(key, key.target);

    const rim = new THREE.PointLight(0xffffff, 78, 20);
    rim.position.set(-4.5, 3.8, 5.5);
    scene.add(rim);

    const fill = new THREE.PointLight(0xd6d6d6, 48, 18);
    fill.position.set(4.2, -2.4, 4);
    scene.add(fill);

    const back = new THREE.DirectionalLight(0xffffff, 2.4);
    back.position.set(0, 1, -3);
    scene.add(back, new THREE.AmbientLight(0xffffff, 0.28));

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let scrollProgress = 0;
    let compact = false;
    const pointerTarget = new THREE.Vector2();
    const pointer = new THREE.Vector2();

    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / Math.max(clientHeight, 1);
      camera.updateProjectionMatrix();
      compact = clientWidth < 720;
      if (compact) {
        ring.scale.set(1.28, 1.05, 0.82);
        topologyThread.scale.set(1.36, 0.9, 0.72);
      } else if (clientWidth < 1100) {
        ring.scale.set(1.78, 1.18, 0.98);
        topologyThread.scale.set(1.88, 0.96, 0.8);
      } else {
        ring.scale.set(2.18, 1.28, 1.05);
        topologyThread.scale.set(2.26, 1.02, 0.86);
      }
    };

    const updateScroll = () => {
      const pageHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      scrollProgress = window.scrollY / pageHeight;
    };

    const updatePointer = (event: PointerEvent) => {
      pointerTarget.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
      );
    };

    const startTime = window.performance.now();
    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const idle = reducedMotion.matches ? 0 : elapsed * 0.075;
      pointer.lerp(pointerTarget, reducedMotion.matches ? 0 : 0.035);
      ring.rotation.y = idle + scrollProgress * Math.PI * 2.6 + pointer.x * 0.08;
      ring.rotation.x = -0.52 + Math.sin(idle * 1.7) * 0.13 + scrollProgress * 0.35 - pointer.y * 0.05;
      ring.rotation.z = -0.08 + Math.sin(scrollProgress * Math.PI * 2) * 0.24;
      ring.position.y = Math.sin(scrollProgress * Math.PI * 3) * 0.35;
      topologyThread.rotation.y = -idle * 0.72 - scrollProgress * Math.PI * 1.45;
      topologyThread.rotation.z = 0.08 + Math.sin(elapsed * 0.12) * 0.08;
      topologyThread.position.y = 0.08 - Math.sin(scrollProgress * Math.PI * 2) * 0.18;
      rim.position.x = -4.5 + pointer.x * 2.2;
      rim.position.y = 3.8 + pointer.y * 1.5;

      if (!reducedMotion.matches && !compact) {
        const positions = geometry.attributes.position.array;
        for (let index = 0; index < positions.length; index += 3) {
          const x = basePositions[index];
          const y = basePositions[index + 1];
          const z = basePositions[index + 2];
          const wave = Math.sin(elapsed * 0.55 + x * 0.72 + z * 0.48) * 0.035;
          positions[index] = x * (1 + wave * 0.035);
          positions[index + 1] = y + wave;
          positions[index + 2] = z * (1 - wave * 0.02);
        }
        geometry.attributes.position.needsUpdate = true;
        if (Math.floor(elapsed * 30) % 4 === 0) geometry.computeVertexNormals();
      }

      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(render);
    };

    resize();
    updateScroll();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("pointermove", updatePointer, { passive: true });
    frame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("pointermove", updatePointer);
      themeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      nightMaterial.dispose();
      knotGeometry.dispose();
      knotMaterial.dispose();
      environment.dispose();
      environmentMap.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div aria-hidden="true" className="mobius-field">
      <canvas ref={canvasRef} />
    </div>
  );
}
