"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function Interactive3DBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. 3D Bio-Helix & Torus Knot Wireframe Group
    const group = new THREE.Group();
    scene.add(group);

    // Primary Torus Knot Wireframe (Emerald / Cyan glowing mesh like screenshot)
    const knotGeometry = new THREE.TorusKnotGeometry(8, 2.2, 120, 24, 2, 3);
    const knotMaterial = new THREE.MeshBasicMaterial({
      color: 0x00e599,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const knotMesh = new THREE.Mesh(knotGeometry, knotMaterial);
    knotMesh.position.set(4, 0, -2);
    group.add(knotMesh);

    // Secondary Inner Mesh (Deep Cyan)
    const innerKnotGeo = new THREE.TorusKnotGeometry(7.8, 1.2, 80, 16, 3, 4);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const innerMesh = new THREE.Mesh(innerKnotGeo, innerMaterial);
    innerMesh.position.set(4, 0, -2);
    group.add(innerMesh);

    // 3. Floating Ambient Particles Field
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 60;
      particlePositions[i + 1] = (Math.random() - 0.5) * 40;
      particlePositions[i + 2] = (Math.random() - 0.5) * 30;
    }

    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.4,
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMaterial);
    scene.add(particles);

    // 4. Mouse Tracking & Smooth Lerp
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      mouseX = (event.clientX - windowHalfX) / windowHalfX;
      mouseY = (event.clientY - windowHalfY) / windowHalfY;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 5. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Continuous slow baseline rotation
      knotMesh.rotation.x = elapsedTime * 0.15;
      knotMesh.rotation.y = elapsedTime * 0.2;
      innerMesh.rotation.x = -elapsedTime * 0.12;
      innerMesh.rotation.z = elapsedTime * 0.15;

      // Mouse sensitivity parallax effect
      targetRotationY = mouseX * 0.6;
      targetRotationX = -mouseY * 0.6;

      group.rotation.y += (targetRotationY - group.rotation.y) * 0.05;
      group.rotation.x += (targetRotationX - group.rotation.x) * 0.05;

      // Particles gentle drifting
      particles.rotation.y = elapsedTime * 0.03;
      particles.rotation.x = mouseX * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // 6. Window Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      knotGeometry.dispose();
      knotMaterial.dispose();
      innerKnotGeo.dispose();
      innerMaterial.dispose();
      particleGeo.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ opacity: 0.85 }}
      aria-hidden="true"
    />
  );
}
