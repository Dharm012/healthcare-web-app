"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

// ============================================================================
// HEALTHCONNECT AI — 3D Bio-Digital Health Nexus
// REALISTIC PALETTE + FLOWING AURORA RIBBONS + REFERENCE-SITE ANIMATIONS
//
// Color Philosophy: Deep navy, pearl white, warm gold, rich burgundy, natural
// teal — premium medical trust. No neon. No plastic.
//
// Animations inspired by:
//   Noomo  → elastic spring deformation on cursor, liquid morphing core
//   Waaark → flowing aurora ribbon trails weaving through space
//   NASA Prospect → deep multi-layer parallax, orbital camera sway
//   Sleepiest → slow warm↔cool color temperature cycling, breathing rhythm
// ============================================================================

export function Interactive3DBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let isMobile = window.innerWidth < 768;
    let isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

    // -- Disposal tracking --
    const geos: THREE.BufferGeometry[] = [];
    const mats: THREE.Material[] = [];
    const g = <T extends THREE.BufferGeometry>(geo: T): T => {
      geos.push(geo);
      return geo;
    };
    const m = <T extends THREE.Material>(mat: T): T => {
      mats.push(mat);
      return mat;
    };

    // =====================================================================
    // 1. SCENE / CAMERA / RENDERER
    // =====================================================================
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf7f1e7, 0.007);

    const camera = new THREE.PerspectiveCamera(
      44,
      window.innerWidth / window.innerHeight,
      0.1,
      600
    );
    const camHome = new THREE.Vector3(0, 0.5, 30);
    camera.position.copy(camHome);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.0 : 1.5));
    renderer.setClearColor(0xf7f1e7, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // =====================================================================
    // 2. LIGHTING — Natural warm studio, not sci-fi
    // =====================================================================
    scene.add(new THREE.AmbientLight(0xfff8f0, 0.85));

    const key = new THREE.DirectionalLight(0xfdfaf3, 2.6); // warm daylight
    key.position.set(10, 14, 12);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xc9daf8, 0.9); // soft sky
    fill.position.set(-12, -6, 8);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xc9a96e, 1.6); // warm gold rim
    rim.position.set(0, -8, -14);
    scene.add(rim);

    const coreLight = new THREE.PointLight(0x2d6a6f, 2.8, 22); // natural teal
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    const warmAccent = new THREE.PointLight(0xc9a96e, 1.4, 16);
    warmAccent.position.set(3, 2, 3);
    scene.add(warmAccent);

    // =====================================================================
    // 3. MASTER GROUP — Responsive positioning
    // =====================================================================
    const master = new THREE.Group();
    const positionMaster = () => {
      isMobile = window.innerWidth < 768;
      isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      if (isMobile) {
        master.position.set(0, -0.5, 0);
        master.scale.setScalar(0.7);
      } else if (isTablet) {
        master.position.set(2.5, -0.2, 1);
        master.scale.setScalar(0.85);
      } else {
        master.position.set(5.5, 0, 2);
        master.scale.setScalar(1.05);
      }
    };
    positionMaster();
    scene.add(master);

    // =====================================================================
    // 4. CENTRAL CORE — Frosted pearl glass biosphere (realistic)
    // =====================================================================
    const coreGrp = new THREE.Group();
    master.add(coreGrp);

    // Outer frosted pearl sphere (detail 3 gives 1,280 smooth faces instead of 81k, saving 98% memory)
    const outerGeo = g(new THREE.IcosahedronGeometry(3.5, 3));
    const outerMat = m(
      new THREE.MeshPhysicalMaterial({
        color: 0xe8e0d0, // warm pearl ivory
        emissive: 0x1a1a2e,
        emissiveIntensity: 0.08,
        roughness: 0.18,
        metalness: 0.25,
        clearcoat: 1.0,
        clearcoatRoughness: 0.12,
        transmission: 0.68,
        ior: 1.42,
        transparent: true,
        opacity: 0.38,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    coreGrp.add(outerMesh);

    // Clean geodesic structural wireframe — champagne gold, light & crisp (detail 2)
    const wireGeo = g(new THREE.IcosahedronGeometry(3.52, 2));
    const wireframeMat = m(
      new THREE.MeshBasicMaterial({
        color: 0xc9a96e,
        wireframe: true,
        transparent: true,
        opacity: 0.14,
        depthWrite: false,
      })
    );
    coreGrp.add(new THREE.Mesh(wireGeo, wireframeMat));

    // Inner deep-teal medical core
    const innerGeo = g(new THREE.SphereGeometry(2.0, 32, 32));
    const innerMat = m(
      new THREE.MeshStandardMaterial({
        color: 0x2d6a6f, // natural deep teal
        emissive: 0x1a3c40,
        emissiveIntensity: 0.45,
        roughness: 0.35,
        metalness: 0.15,
        wireframe: true,
      })
    );
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreGrp.add(innerMesh);

    // Warm gold nucleus
    const nucleusGeo = g(new THREE.SphereGeometry(1.1, 20, 20));
    const nucleusMat = m(
      new THREE.MeshStandardMaterial({
        color: 0xc9a96e, // champagne gold
        emissive: 0x8b6914,
        emissiveIntensity: 0.55,
        roughness: 0.22,
        metalness: 0.35,
      })
    );
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    coreGrp.add(nucleusMesh);

    // Synaptic connector nodes inside core — warm white
    const synCount = 28;
    const synGeo = g(new THREE.SphereGeometry(0.1, 10, 10));
    const synMat = m(
      new THREE.MeshBasicMaterial({
        color: 0xfff8f0,
        transparent: true,
        opacity: 0.85,
      })
    );
    const synMesh = new THREE.InstancedMesh(synGeo, synMat, synCount);
    coreGrp.add(synMesh);

    const dummy = new THREE.Object3D();
    const synPositions: THREE.Vector3[] = [];

    for (let i = 0; i < synCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.2 + Math.random() * 0.7;
      const pos = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      synPositions.push(pos);
      dummy.position.copy(pos);
      dummy.scale.setScalar(0.6 + Math.random() * 0.8);
      dummy.updateMatrix();
      synMesh.setMatrixAt(i, dummy.matrix);
    }
    synMesh.instanceMatrix.needsUpdate = true;

    // =====================================================================
    // 5. DNA DOUBLE HELIX — Rich burgundy & champagne gold
    // =====================================================================
    const dnaGrp = new THREE.Group();
    master.add(dnaGrp);

    const dnaH = 15,
      dnaR = 4.6,
      dnaTurns = 2.8;
    const s1Pts: THREE.Vector3[] = [];
    const s2Pts: THREE.Vector3[] = [];

    for (let i = 0; i < 80; i++) {
      const t = i / 79;
      const a = t * Math.PI * 2 * dnaTurns;
      const y = (t - 0.5) * dnaH;
      s1Pts.push(new THREE.Vector3(Math.cos(a) * dnaR, y, Math.sin(a) * dnaR));
      s2Pts.push(
        new THREE.Vector3(
          Math.cos(a + Math.PI) * dnaR,
          y,
          Math.sin(a + Math.PI) * dnaR
        )
      );
    }

    const strandMat = m(
      new THREE.MeshPhysicalMaterial({
        color: 0x8b0000, // deep burgundy-crimson
        emissive: 0x4a0000,
        emissiveIntensity: 0.25,
        roughness: 0.3,
        metalness: 0.15,
        clearcoat: 0.7,
        transparent: true,
        opacity: 0.82,
      })
    );

    const s1Geo = g(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(s1Pts), 70, 0.1, 8, false)
    );
    const s2Geo = g(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(s2Pts), 70, 0.1, 8, false)
    );
    dnaGrp.add(new THREE.Mesh(s1Geo, strandMat));
    dnaGrp.add(new THREE.Mesh(s2Geo, strandMat));

    // Rungs — alternating champagne gold & ivory
    const rungGeo = g(new THREE.CylinderGeometry(0.045, 0.045, 1, 6));
    const rungMatA = m(
      new THREE.MeshStandardMaterial({
        color: 0xc9a96e,
        emissive: 0x8b6914,
        emissiveIntensity: 0.35,
      })
    );
    const rungMatB = m(
      new THREE.MeshStandardMaterial({
        color: 0xe8e0d0,
        emissive: 0xa09070,
        emissiveIntensity: 0.25,
      })
    );

    const rungsN = 28;
    for (let r = 0; r < rungsN; r++) {
      const t = r / (rungsN - 1);
      const a = t * Math.PI * 2 * dnaTurns;
      const y = (t - 0.5) * dnaH;
      const p1 = new THREE.Vector3(
        Math.cos(a) * dnaR,
        y,
        Math.sin(a) * dnaR
      );
      const p2 = new THREE.Vector3(
        Math.cos(a + Math.PI) * dnaR,
        y,
        Math.sin(a + Math.PI) * dnaR
      );
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const dist = p1.distanceTo(p2);
      const rungMesh = new THREE.Mesh(rungGeo, r % 2 === 0 ? rungMatA : rungMatB);
      rungMesh.position.copy(mid);
      rungMesh.scale.set(1, dist, 1);
      rungMesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3().subVectors(p2, p1).normalize()
      );
      dnaGrp.add(rungMesh);
    }

    // =====================================================================
    // 6. ORBITAL RINGS — Brushed silver / platinum steel
    // =====================================================================
    const orbGrp = new THREE.Group();
    master.add(orbGrp);

    interface RDef {
      radius: number;
      tube: number;
      rot: [number, number, number];
      color: number;
      speed: number;
    }

    const ringDefs: RDef[] = [
      { radius: 5.8, tube: 0.04, rot: [1.1, 0.2, 0], color: 0x8892b0, speed: 0.004 },
      { radius: 7.0, tube: 0.035, rot: [-0.8, 0.5, 0], color: 0xa9b4c2, speed: -0.003 },
      { radius: 8.5, tube: 0.03, rot: [0.35, -1.0, 0], color: 0xc9a96e, speed: 0.0025 },
    ];

    const ringMeshes: THREE.Mesh[] = [];

    ringDefs.forEach((d) => {
      const rGeo = g(new THREE.TorusGeometry(d.radius, d.tube, 10, 64));
      const rMat = m(
        new THREE.MeshStandardMaterial({
          color: d.color,
          emissive: d.color,
          emissiveIntensity: 0.3,
          roughness: 0.35,
          metalness: 0.75,
        })
      );
      const mesh = new THREE.Mesh(rGeo, rMat);
      mesh.rotation.set(...d.rot);
      orbGrp.add(mesh);
      ringMeshes.push(mesh);
    });

    // Satellite beacons on rings
    interface SDef {
      ringIdx: number;
      angle: number;
      speed: number;
      color: number;
    }

    const satDefs: SDef[] = [
      { ringIdx: 0, angle: 0, speed: 0.011, color: 0x2d6a6f },
      { ringIdx: 1, angle: 2.5, speed: -0.008, color: 0x8b0000 },
      { ringIdx: 2, angle: 4.7, speed: 0.006, color: 0xc9a96e },
      { ringIdx: 0, angle: 3.8, speed: 0.011, color: 0x8892b0 },
    ];

    const satGeo = g(new THREE.OctahedronGeometry(0.3, 0));
    const satGroups: THREE.Group[] = [];

    satDefs.forEach((s) => {
      const sg = new THREE.Group();
      const sMat = m(
        new THREE.MeshStandardMaterial({
          color: s.color,
          emissive: s.color,
          emissiveIntensity: 0.5,
          roughness: 0.2,
          metalness: 0.6,
        })
      );
      sg.add(new THREE.Mesh(satGeo, sMat));
      // Mini halo
      const hGeo = g(new THREE.TorusGeometry(0.5, 0.018, 8, 20));
      const hMat = m(
        new THREE.MeshBasicMaterial({
          color: s.color,
          transparent: true,
          opacity: 0.45,
        })
      );
      sg.add(new THREE.Mesh(hGeo, hMat));
      orbGrp.add(sg);
      satGroups.push(sg);
    });

    // =====================================================================
    // 7. FLOWING AURORA RIBBONS (instead of dust) — Waaark fluid influence
    // =====================================================================
    // Three flowing ribbons that weave through space, representing data
    // streams, patient-doctor connection, and live vital streams.
    const ribbonGrp = new THREE.Group();
    master.add(ribbonGrp);

    interface RibbonDef {
      color: number;
      opacity: number;
      yOff: number;
      phase: number;
      amplitude: number;
      width: number;
    }

    const ribbonDefs: RibbonDef[] = [
      { color: 0x2d6a6f, opacity: 0.35, yOff: -3.2, phase: 0, amplitude: 2.5, width: 0.5 },
      { color: 0xc9a96e, opacity: 0.28, yOff: -1.5, phase: 1.8, amplitude: 2.0, width: 0.4 },
      { color: 0x8b0000, opacity: 0.22, yOff: 1.0, phase: 3.6, amplitude: 1.8, width: 0.35 },
    ];

    const ribbonMeshes: THREE.Mesh[] = [];
    const ribbonCurves: THREE.CatmullRomCurve3[] = [];
    const ribbonPtCounts = 50;

    ribbonDefs.forEach((rd) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i < ribbonPtCounts; i++) {
        const t = i / (ribbonPtCounts - 1);
        const x = (t - 0.5) * 22;
        const y = rd.yOff + Math.sin(t * Math.PI * 3 + rd.phase) * rd.amplitude;
        const z = Math.cos(t * Math.PI * 2.5 + rd.phase) * 2.0;
        pts.push(new THREE.Vector3(x, y, z));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      ribbonCurves.push(curve);

      // Flat ribbon using custom geometry from extruding along curve
      const rGeo = g(new THREE.TubeGeometry(curve, 36, rd.width, 3, false));
      const rMat = m(
        new THREE.MeshPhysicalMaterial({
          color: rd.color,
          emissive: rd.color,
          emissiveIntensity: 0.2,
          roughness: 0.3,
          metalness: 0.1,
          clearcoat: 0.5,
          transparent: true,
          opacity: rd.opacity,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      const mesh = new THREE.Mesh(rGeo, rMat);
      ribbonGrp.add(mesh);
      ribbonMeshes.push(mesh);
    });

    // =====================================================================
    // 8. FLOATING MEDICAL HEXAGONAL SHIELDS (replacing dust/particles)
    // =====================================================================
    // Softly rotating hexagons scattered in space — symbolic of protection,
    // connectivity, and precision medicine. Much more purposeful than dust.
    const hexGrp = new THREE.Group();
    scene.add(hexGrp);

    const hexCount = isMobile ? 12 : 30;
    const hexGeo = g(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 6));
    const hexMat = m(
      new THREE.MeshPhysicalMaterial({
        color: 0xc9a96e,
        emissive: 0x8b6914,
        emissiveIntensity: 0.15,
        roughness: 0.25,
        metalness: 0.5,
        clearcoat: 0.6,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );

    interface HexData {
      mesh: THREE.Mesh;
      pos: THREE.Vector3;
      rotSpeed: THREE.Vector3;
      driftSpeed: THREE.Vector3;
      phase: number;
    }

    const hexes: HexData[] = [];

    for (let i = 0; i < hexCount; i++) {
      const mesh = new THREE.Mesh(hexGeo, hexMat);
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 28,
        (Math.random() - 0.5) * 30
      );
      mesh.position.copy(pos);
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      const sc = 0.6 + Math.random() * 1.2;
      mesh.scale.setScalar(sc);
      hexGrp.add(mesh);
      hexes.push({
        mesh,
        pos,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.006,
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.004
        ),
        driftSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.003,
          0.002 + Math.random() * 0.004,
          (Math.random() - 0.5) * 0.003
        ),
        phase: Math.random() * Math.PI * 2,
      });
    }

    // =====================================================================
    // 9. NEURAL NETWORK CONNECTIONS — Glowing lines between satellites
    // =====================================================================
    // Dynamic light-line connections that pulse between orbital nodes,
    // representing real-time data flow (Noomo's connected intelligence)
    const connectionMat = m(
      new THREE.LineBasicMaterial({
        color: 0xc9a96e,
        transparent: true,
        opacity: 0.35,
      })
    );

    const connectionLines: THREE.Line[] = [];
    // Connect each satellite to the core center
    for (let i = 0; i < satDefs.length; i++) {
      const lineGeo = g(new THREE.BufferGeometry());
      const positions = new Float32Array(6); // 2 points x 3
      lineGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const line = new THREE.Line(lineGeo, connectionMat);
      orbGrp.add(line);
      connectionLines.push(line);
    }

    // =====================================================================
    // 10. INTERACTION — Mouse parallax + Multi-stage Scroll
    // =====================================================================
    let mouseX = 0,
      mouseY = 0,
      smX = 0,
      smY = 0,
      scrollProg = 0,    // raw 0→1
      smoothScroll = 0;  // eased for cinematic feel

    const onMouse = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => {
      // Extended range for multi-stage scroll
      scrollProg = Math.min(Math.max(window.scrollY / 2400, 0), 1);
    };

    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Utility: smooth step for stage transitions
    const smoothstep = (edge0: number, edge1: number, x: number) => {
      const v = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
      return v * v * (3 - 2 * v);
    };

    // =====================================================================
    // 11. ANIMATION LOOP
    // =====================================================================
    let frameId: number;
    const t0 = performance.now();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (typeof document !== "undefined" && document.hidden) return;
      const t = (performance.now() - t0) * 0.001;

      // Smooth inertia (Noomo-style spring physics)
      smX += (mouseX - smX) * 0.04;
      smY += (mouseY - smY) * 0.04;

      if (!prefersReducedMotion) {
        // -----------------------------------------------------------
        // A. CORE ROTATION + ELASTIC DEFORMATION (Noomo influence)
        // -----------------------------------------------------------
        coreGrp.rotation.y += 0.003;
        coreGrp.rotation.x = Math.sin(t * 0.35) * 0.05;

        // Elastic deformation toward cursor — squash & stretch
        const stretchX = 1 + smX * 0.06;
        const stretchY = 1 - Math.abs(smX) * 0.03 + smY * 0.04;
        outerMesh.scale.set(stretchX, stretchY, 1 + Math.abs(smY) * 0.04);

        // Breathing pulse (Sleepiest calming rhythm)
        const breath = 1 + Math.sin(t * 1.6) * 0.03 + Math.sin(t * 3.2) * 0.01;
        innerMesh.scale.setScalar(breath * 0.97);
        nucleusMesh.scale.setScalar(1 + Math.sin(t * 2.2) * 0.07);

        // Subsurface glow pulse
        coreLight.intensity = 2.2 + Math.sin(t * 1.6) * 0.8;

        // -----------------------------------------------------------
        // B. WARM↔COOL COLOR TEMPERATURE CYCLING (Sleepiest influence)
        // -----------------------------------------------------------
        const warmth = (Math.sin(t * 0.25) + 1) * 0.5; // 0-1 cycle over ~25s
        const lerpColor = new THREE.Color();
        lerpColor.lerpColors(
          new THREE.Color(0x2d6a6f), // cool teal
          new THREE.Color(0xc9a96e), // warm gold
          warmth * 0.25 // subtle shift
        );
        nucleusMat.emissive.copy(lerpColor);

        // -----------------------------------------------------------
        // C. DNA HELIX — smooth independent rotation
        // -----------------------------------------------------------
        dnaGrp.rotation.y += 0.006;

        // -----------------------------------------------------------
        // D. ORBITAL RING ROTATION + SATELLITE ORBIT (NASA Prospect)
        // -----------------------------------------------------------
        ringMeshes.forEach((rm, i) => {
          rm.rotation.z += ringDefs[i].speed;
        });

        satDefs.forEach((s, i) => {
          s.angle += s.speed;
          const rd = ringDefs[s.ringIdx];
          const lx = Math.cos(s.angle) * rd.radius;
          const ly = Math.sin(s.angle) * rd.radius;
          const sv = new THREE.Vector3(lx, ly, 0).applyEuler(
            new THREE.Euler(...rd.rot)
          );
          satGroups[i].position.copy(sv);
          satGroups[i].rotation.x += 0.018;
          satGroups[i].rotation.y += 0.025;

          // Update neural connection lines (core center → satellite)
          const linePositions = connectionLines[i].geometry.attributes
            .position as THREE.BufferAttribute;
          linePositions.setXYZ(0, 0, 0, 0);
          linePositions.setXYZ(1, sv.x, sv.y, sv.z);
          linePositions.needsUpdate = true;
        });

        // Pulse connection line opacity
        (connectionMat as THREE.LineBasicMaterial).opacity =
          0.2 + Math.sin(t * 2.0) * 0.15;

        // -----------------------------------------------------------
        // E. FLOWING AURORA RIBBONS (Waaark wave dynamics)
        // -----------------------------------------------------------
        ribbonGrp.rotation.y += 0.002;
        ribbonMeshes.forEach((rm, i) => {
          rm.position.x = Math.sin(t * 0.3 + ribbonDefs[i].phase) * 0.4;
          rm.position.y = Math.cos(t * 0.25 + ribbonDefs[i].phase) * 0.3;
        });

        // -----------------------------------------------------------
        // F. HEXAGONAL SHIELDS — gentle drift & tumble
        // -----------------------------------------------------------
        hexes.forEach((h) => {
          h.mesh.rotation.x += h.rotSpeed.x;
          h.mesh.rotation.y += h.rotSpeed.y;
          h.mesh.rotation.z += h.rotSpeed.z;
          h.pos.y += h.driftSpeed.y + Math.sin(t * 0.5 + h.phase) * 0.002;
          h.pos.x += h.driftSpeed.x;

          // Wrap
          if (h.pos.y > 16) h.pos.y = -16;
          if (h.pos.x > 22) h.pos.x = -22;
          if (h.pos.x < -22) h.pos.x = 22;

          h.mesh.position.copy(h.pos);
        });

        // Hex parallax layer (NASA Prospect deep parallax)
        hexGrp.rotation.y = smX * 0.08;
        hexGrp.rotation.x = -smY * 0.05;

        // -----------------------------------------------------------
        // G. MASTER GROUP — levitation, cursor tilt, camera sway
        // -----------------------------------------------------------
        // Weightless vertical levitation
        master.position.y =
          (isMobile ? -0.5 : 0) + Math.sin(t * 0.75) * 0.35;

        // Cursor tilt
        master.rotation.y = smX * 0.4;
        master.rotation.x = -smY * 0.25;

      }

      // -----------------------------------------------------------
      // H. MULTI-STAGE CINEMATIC SCROLL SYSTEM
      //    Inspired by Noomo / NASA Prospect / Sleepiest / Waaark
      // -----------------------------------------------------------
      // Smooth scroll interpolation (spring-eased, not jerky)
      smoothScroll += (scrollProg - smoothScroll) * 0.06;
      const sp = smoothScroll; // shorthand

      // Stage progress values (smoothstepped for buttery transitions)
      const s1 = smoothstep(0, 0.3, sp);      // Stage 1: Hero → Exploration
      const s2 = smoothstep(0.25, 0.6, sp);   // Stage 2: Exploration → Deep dive
      const s3 = smoothstep(0.55, 1.0, sp);   // Stage 3: Deep dive → Immersion

      // -- Camera Path (curved spline, not linear z-move) --
      // Stage 1: gentle pullback + slight upward drift
      const camZ1 = camHome.z - s1 * 5;
      const camY1 = camHome.y + s1 * 1.5;
      const camX1 = camHome.x;

      // Stage 2: swoop sideways + tilt down (exploration orbit)
      const camZ2 = camZ1 - s2 * 6;
      const camY2 = camY1 - s2 * 0.8;
      const camX2 = camX1 + s2 * 2.5 * Math.sin(sp * Math.PI);

      // Stage 3: dive inward toward core
      const camZ3 = camZ2 - s3 * 5;
      const camY3 = camY2 + s3 * 0.5;
      const camX3 = camX2 - s3 * 1.5;

      // Spring-eased camera position (never snap, always glide)
      camera.position.x += (camX3 - camera.position.x) * 0.05;
      camera.position.z += (camZ3 - camera.position.z) * 0.05;
      camera.position.y += (camY3 - camera.position.y) * 0.05;

      // Orbital sway layered on top (NASA Prospect gentle drift)
      camera.position.x += Math.sin(t * 0.15) * 0.8;
      camera.position.y += Math.cos(t * 0.12) * 0.4;

      // Subtle camera tilt on scroll (Waaark's fluid roll)
      camera.rotation.z = -sp * 0.025;

      // -- Core group: rotate faster on scroll, shrink outer shell --
      coreGrp.rotation.y += sp * 0.004;
      outerMat.opacity = 0.38 - s2 * 0.15 - s3 * 0.10;
      innerMat.emissiveIntensity = 0.45 + s2 * 0.3;
      nucleusMat.emissiveIntensity = 0.55 + s3 * 0.45;

      // -- DNA helix: tilt and scale up during exploration --
      const dnaTilt = s2 * 0.25;
      const dnaScale = 1 + s2 * 0.15;
      dnaGrp.rotation.x = dnaTilt;
      dnaGrp.scale.setScalar(dnaScale);

      // -- Orbital rings: expand outward + tilt dramatically --
      const orbScale = 1 + s1 * 0.08 + s2 * 0.18 + s3 * 0.1;
      orbGrp.scale.setScalar(orbScale);
      orbGrp.rotation.x = s2 * 0.15;
      orbGrp.rotation.z = -s2 * 0.1;

      // -- Ribbons: spread wider on scroll (Waaark wave expansion) --
      ribbonGrp.scale.set(
        1 + s2 * 0.2,
        1 + s1 * 0.1 + s2 * 0.15,
        1 + s2 * 0.2
      );
      ribbonGrp.position.y = -s2 * 1.5;

      // -- Hex shields: deep parallax displacement (NASA Prospect) --
      // Different hexes move at different rates for depth illusion
      hexes.forEach((h, i) => {
        const depthFactor = 0.5 + (i / hexCount) * 0.5;
        const parallaxY = sp * 3.5 * depthFactor;
        const parallaxZ = sp * 2.0 * (1 - depthFactor);
        h.mesh.position.y = h.pos.y + parallaxY;
        h.mesh.position.z = h.pos.z - parallaxZ;
        // Fade distant hexes on deep dive
        const hexOpacity = Math.max(0.1, 0.4 - s3 * 0.2 * depthFactor);
        (h.mesh.material as THREE.MeshPhysicalMaterial).opacity = hexOpacity;
      });

      // -- Neural connections: brighten on deep dive --
      (connectionMat as THREE.LineBasicMaterial).opacity =
        0.2 + Math.sin(t * 2.0) * 0.15 + s3 * 0.3;

      // -- Color temperature shift (Sleepiest): warm→cool on scroll --
      const scrollWarmth = 1 - sp * 0.6;
      warmAccent.intensity = 1.4 * scrollWarmth;
      coreLight.color.lerpColors(
        new THREE.Color(0x2d6a6f),
        new THREE.Color(0x1a3c5e),
        s3
      );

      // -- Master group: subtle forward lean on scroll --
      master.rotation.z = -sp * 0.03;

      renderer.render(scene, camera);
    };

    animate();

    // =====================================================================
    // 12. RESIZE
    // =====================================================================
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.0 : 1.5)
      );
      positionMaster();
    };
    window.addEventListener("resize", onResize);

    // =====================================================================
    // 13. CLEANUP
    // =====================================================================
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (container && renderer.domElement)
        container.removeChild(renderer.domElement);
      geos.forEach((geo) => geo.dispose());
      mats.forEach((mat) => mat.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ opacity: 0.96 }}
      aria-hidden="true"
    />
  );
}
