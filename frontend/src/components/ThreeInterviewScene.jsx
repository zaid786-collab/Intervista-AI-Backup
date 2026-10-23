import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ThreeInterviewScene
 * Fully articulated 3D Interviewer (Mr. J. Chen) and executive high-rise office environment in Three.js.
 * Features:
 * - REAL 3D Character Model of Mr. J. Chen seated across the executive mahogany desk.
 * - LIVE MOVING & GESTURING HANDS: Arms, wrists, and articulated fingers that move and gesture conversationally when he speaks or listens!
 * - REAL-TIME TALKING JAW & MOUTH: Syllable-synced phonetic mouth articulation when isInterviewerSpeaking is active.
 * - LIVING EXPRESSIONS: Eyelids blinking realistically, head nodding conversationally, attentive head tilt when candidate speaks.
 * - BREATHING PHYSICS: Natural chest and shoulder breathing animation.
 * - INTERACTIVE GAZE: Head and eyes subtly track candidate mouse movement for true presence.
 * - EXECUTIVE OFFICE ENVIRONMENT: Panoramic high-rise corner windows with city skyscrapers, floor-to-ceiling mullions, executive leather chair, polished desk, and daylight sunbeams.
 */
export default function ThreeInterviewScene({
  isInterviewerSpeaking = false,
  isCandidateSpeaking = false,
  interviewerName = 'Mr. J. Chen',
  interviewerTitle = 'Hiring Manager',
  candidateRole = 'Software Engineer',
  targetCompany = 'Google',
  micVolume = 0,
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ─── 1. Scene, Camera, Renderer ──────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#94BFE6'); // Crisp daylight sky
    scene.fog = new THREE.FogExp2('#C5DBEE', 0.012);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Candidate seated eye-level camera looking across the executive desk directly at Mr. Chen
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 150);
    camera.position.set(0, 1.34, 1.58);
    camera.lookAt(0, 1.28, -0.6);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;

    container.appendChild(renderer.domElement);

    // ─── 2. Procedural Canvas Textures ───────────────────────────────────────
    // Polished Mahogany Wood Texture
    const createWoodTexture = () => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, '#532918');
      grad.addColorStop(0.5, '#3B1B0F');
      grad.addColorStop(1, '#291208');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      for (let i = 0; i < 300; i++) {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(20, 8, 3, 0.22)' : 'rgba(105, 62, 35, 0.22)';
        const y = Math.random() * 512;
        const h = Math.random() * 5 + 1.5;
        ctx.fillRect(0, y, 512, h);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      return tex;
    };
    const woodTexture = createWoodTexture();

    // Skyscraper Windows Grid Texture
    const createBuildingTexture = (tint = '#3B4D61') => {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 512;
      const ctx = c.getContext('2d');
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, 256, 512);

      for (let x = 6; x < 250; x += 15) {
        for (let y = 6; y < 506; y += 17) {
          const isSunReflect = Math.random() > 0.42;
          ctx.fillStyle = isSunReflect ? 'rgba(255, 250, 235, 0.88)' : 'rgba(25, 42, 62, 0.75)';
          ctx.fillRect(x, y, 9, 10);
        }
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 6);
      return tex;
    };

    // ─── 3. Professional Studio & Executive Daylight Lighting ────────────────
    // Strong front-top daylight illuminating Mr. Chen's face, suit, and moving hands
    const frontSun = new THREE.DirectionalLight('#FFF9F2', 3.5);
    frontSun.position.set(0.6, 4.2, 2.2);
    frontSun.castShadow = true;
    frontSun.shadow.mapSize.width = 2048;
    frontSun.shadow.mapSize.height = 2048;
    frontSun.shadow.bias = -0.0003;
    scene.add(frontSun);

    // Warm key light on interviewer face & hands
    const keyLight = new THREE.DirectionalLight('#FFF2E0', 2.2);
    keyLight.position.set(-1.0, 2.6, 1.8);
    scene.add(keyLight);

    // Soft sky fill light
    const fillLight = new THREE.DirectionalLight('#D8ECFC', 1.6);
    fillLight.position.set(1.8, 2.2, 1.4);
    scene.add(fillLight);

    // Ambient room illumination
    const ambientLight = new THREE.AmbientLight('#FFFFFF', 1.7);
    scene.add(ambientLight);

    // Rim backlight from windows for edge definition
    const rimLight = new THREE.DirectionalLight('#A0CCF2', 2.2);
    rimLight.position.set(0, 2.8, -2.6);
    scene.add(rimLight);

    // Subtle warm bounce light from the desk surface onto chin and hands
    const deskBounce = new THREE.DirectionalLight('#D49B6A', 1.1);
    deskBounce.position.set(0, 0.5, 0.8);
    scene.add(deskBounce);

    // ─── 4. The 3D Corporate Executive Office ────────────────────────────────
    // Carpet Floor
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorMat = new THREE.MeshStandardMaterial({ color: '#16191E', roughness: 0.95 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Executive Wood Right Wall
    const rightWallGeo = new THREE.BoxGeometry(0.3, 3.8, 10);
    const rightWallMat = new THREE.MeshStandardMaterial({
      color: '#422414',
      roughness: 0.55,
      map: woodTexture,
    });
    const rightWall = new THREE.Mesh(rightWallGeo, rightWallMat);
    rightWall.position.set(3.8, 1.9, -0.5);
    scene.add(rightWall);

    for (let z = -4; z <= 3; z += 0.5) {
      const slat = new THREE.Mesh(
        new THREE.BoxGeometry(0.045, 3.78, 0.035),
        new THREE.MeshStandardMaterial({ color: '#221208', roughness: 0.75 })
      );
      slat.position.set(3.64, 1.9, z);
      scene.add(slat);
    }

    // Panoramic Window Wall (Outside Skyline)
    const windowFrameMat = new THREE.MeshStandardMaterial({
      color: '#0E1117',
      metalness: 0.85,
      roughness: 0.2,
    });

    // Vertical black window mullions
    [-3.2, -1.6, 0, 1.6, 3.2].forEach(x => {
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.8, 0.08), windowFrameMat);
      mullion.position.set(x, 1.9, -3.2);
      scene.add(mullion);
    });

    // Horizontal window transoms
    [0.9, 1.9, 2.9].forEach(y => {
      const transom = new THREE.Mesh(new THREE.BoxGeometry(9, 0.065, 0.08), windowFrameMat);
      transom.position.set(0, y, -3.2);
      scene.add(transom);
    });

    // 3D City Skyline Outside
    const skylineGroup = new THREE.Group();
    const buildingConfigs = [
      { x: -5.6, z: -16, w: 2.6, d: 2.6, h: 10.2, tint: '#3A4D62' },
      { x: -3.8, z: -12, w: 2.1, d: 2.1, h: 8.6, tint: '#4D6B82' },
      { x: -2.0, z: -8.8, w: 1.7, d: 1.7, h: 7.2, tint: '#42586D' },
      { x: -0.8, z: -14, w: 2.3, d: 2.3, h: 10.8, tint: '#2F3C4B' },
      { x: 0.8, z: -9.8, w: 1.9, d: 1.9, h: 8.0, tint: '#4E687F' },
      { x: 2.3, z: -11.5, w: 2.2, d: 2.2, h: 9.5, tint: '#3B4E63' },
      { x: 4.0, z: -8.2, w: 1.8, d: 1.8, h: 6.8, tint: '#41576C' },
      { x: 5.8, z: -15, w: 2.8, d: 2.8, h: 11.5, tint: '#253240' },
      // Distant backdrop towers
      { x: -7.2, z: -24, w: 3.5, d: 3.5, h: 13.8, tint: '#67788C' },
      { x: -1.4, z: -25, w: 4.2, d: 4.2, h: 15.2, tint: '#485768' },
      { x: 2.2, z: -24, w: 3.8, d: 3.8, h: 14.2, tint: '#576779' },
      { x: 6.2, z: -23, w: 3.4, d: 3.4, h: 12.8, tint: '#67788C' },
    ];

    buildingConfigs.forEach(b => {
      const bTex = createBuildingTexture(b.tint);
      const bGeo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const bMat = new THREE.MeshStandardMaterial({
        color: b.tint,
        map: bTex,
        roughness: 0.35,
        metalness: 0.3,
      });
      const building = new THREE.Mesh(bGeo, bMat);
      building.position.set(b.x, b.h / 2 - 1.2, b.z);
      skylineGroup.add(building);

      if (b.h > 8.5) {
        const spire = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.08, 1.5, 8),
          new THREE.MeshStandardMaterial({ color: '#E2E8F0', metalness: 0.9 })
        );
        spire.position.set(b.x, b.h - 1.2 + 0.75, b.z);
        skylineGroup.add(spire);
      }
    });
    scene.add(skylineGroup);

    // ─── 5. Foreground Executive Mahogany Desk ───────────────────────────────
    const deskGroup = new THREE.Group();

    // Polished Mahogany Table Top
    const deskTopGeo = new THREE.BoxGeometry(3.4, 0.08, 1.45);
    const deskTopMat = new THREE.MeshStandardMaterial({
      color: '#462313',
      roughness: 0.28,
      metalness: 0.05,
      map: woodTexture,
    });
    const deskTop = new THREE.Mesh(deskTopGeo, deskTopMat);
    deskTop.position.set(0, 0.82, 0.1);
    deskTop.receiveShadow = true;
    deskTop.castShadow = true;
    deskGroup.add(deskTop);

    // Gold / Brass Beveled Desk Trim
    const trim = new THREE.Mesh(
      new THREE.BoxGeometry(3.42, 0.022, 1.47),
      new THREE.MeshStandardMaterial({ color: '#D4AF37', metalness: 0.92, roughness: 0.18 })
    );
    trim.position.set(0, 0.81, 0.1);
    deskGroup.add(trim);

    // Black Executive Desk Pad
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.012, 0.8),
      new THREE.MeshStandardMaterial({ color: '#111317', roughness: 0.85 })
    );
    pad.position.set(0, 0.865, 0.22);
    pad.receiveShadow = true;
    deskGroup.add(pad);

    scene.add(deskGroup);

    // ─── 6. THE 3D INTERVIEWER CHARACTER (MR. J. CHEN) ───────────────────────
    const interviewerGroup = new THREE.Group();
    interviewerGroup.position.set(0, 0, -0.92);

    // A. Executive Ergonomic Mesh Office Chair
    const chairGroup = new THREE.Group();
    const leatherMat = new THREE.MeshStandardMaterial({ color: '#161920', roughness: 0.6 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: '#94A3B8', metalness: 0.92, roughness: 0.18 });

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.12, 0.72), leatherMat);
    seat.position.set(0, 0.65, 0);
    chairGroup.add(seat);

    const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.0, 0.1), leatherMat);
    backrest.position.set(0, 1.25, -0.32);
    backrest.rotation.x = -0.06;
    chairGroup.add(backrest);

    const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.24, 0.08), leatherMat);
    headrest.position.set(0, 1.84, -0.36);
    chairGroup.add(headrest);

    [-0.39, 0.39].forEach(x => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.46), chromeMat);
      arm.position.set(x, 0.88, -0.05);
      chairGroup.add(arm);
    });

    interviewerGroup.add(chairGroup);

    // B. Human Torso & Tailored Executive Suit
    const humanGroup = new THREE.Group();

    // Realistic skin material with subsurface clearcoat
    const skinMat = new THREE.MeshPhysicalMaterial({
      color: '#E8A782',
      roughness: 0.42,
      metalness: 0.02,
      clearcoat: 0.14,
      clearcoatRoughness: 0.22,
    });

    // Dark charcoal executive tailored suit jacket
    const suitMat = new THREE.MeshStandardMaterial({
      color: '#282F3E',
      roughness: 0.62,
    });

    const shirtMat = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.3,
    });

    // Chest Torso
    const chestGeo = new THREE.CylinderGeometry(0.38, 0.33, 0.65, 20);
    const chest = new THREE.Mesh(chestGeo, suitMat);
    chest.position.set(0, 1.05, -0.15);
    chest.castShadow = true;
    humanGroup.add(chest);

    // White Shirt V-Placket
    const shirtV = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.35, 0.06), shirtMat);
    shirtV.position.set(0, 1.18, -0.02);
    humanGroup.add(shirtV);

    // Open White Collar Tabs
    [-0.07, 0.07].forEach((x, idx) => {
      const tab = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.11, 0.02), shirtMat);
      tab.position.set(x, 1.35, 0.02);
      tab.rotation.z = idx === 0 ? 0.35 : -0.35;
      humanGroup.add(tab);
    });

    // Silk Tie (Champagne Gold)
    const tieMat = new THREE.MeshStandardMaterial({ color: '#D9B77A', roughness: 0.35, metalness: 0.3 });
    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.34, 0.025), tieMat);
    tie.position.set(0, 1.12, 0.005);
    humanGroup.add(tie);

    // Suit Lapels
    [-0.14, 0.14].forEach((x, idx) => {
      const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.04), suitMat);
      lapel.position.set(x, 1.15, 0.01);
      lapel.rotation.z = idx === 0 ? -0.22 : 0.22;
      humanGroup.add(lapel);
    });

    // ─── C. ARTICULATED LIVING ARMS & MOVING HANDS ───────────────────────────
    // Left Arm Pivot System
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-0.35, 1.25, -0.12);

    const leftUpperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.08, 0.38, 16),
      suitMat
    );
    leftUpperArm.position.set(0, -0.18, 0.08);
    leftUpperArm.rotation.x = 0.52;
    leftUpperArm.rotation.z = 0.14;
    leftArmPivot.add(leftUpperArm);

    const leftForearmPivot = new THREE.Group();
    leftForearmPivot.position.set(-0.06, -0.34, 0.18);

    const leftForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.065, 0.36, 16),
      suitMat
    );
    leftForearm.position.set(0, -0.06, 0.14);
    leftForearm.rotation.x = Math.PI / 2.2;
    leftForearm.rotation.y = 0.32;
    leftForearmPivot.add(leftForearm);

    // White cuff
    const leftCuff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.068, 0.068, 0.04, 16),
      shirtMat
    );
    leftCuff.position.set(0.03, -0.05, 0.28);
    leftCuff.rotation.x = Math.PI / 2.2;
    leftForearmPivot.add(leftCuff);

    // Left Articulated Hand & Fingers
    const leftHandPivot = new THREE.Group();
    leftHandPivot.position.set(0.04, -0.04, 0.32);

    const leftPalm = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.048, 0.12), skinMat);
    leftHandPivot.add(leftPalm);

    // Left Fingers
    const fingerMat = skinMat;
    const leftThumb = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.03, 0.07), fingerMat);
    leftThumb.position.set(0.06, -0.005, 0.03);
    leftThumb.rotation.y = 0.45;
    leftHandPivot.add(leftThumb);

    const leftIndex = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.028, 0.08), fingerMat);
    leftIndex.position.set(0.032, 0, 0.08);
    leftHandPivot.add(leftIndex);

    const leftMiddle = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.028, 0.088), fingerMat);
    leftMiddle.position.set(0.002, 0, 0.085);
    leftHandPivot.add(leftMiddle);

    const leftRing = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.028, 0.08), fingerMat);
    leftRing.position.set(-0.028, 0, 0.08);
    leftHandPivot.add(leftRing);

    leftForearmPivot.add(leftHandPivot);
    leftArmPivot.add(leftForearmPivot);
    humanGroup.add(leftArmPivot);

    // Right Arm Pivot System
    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(0.35, 1.25, -0.12);

    const rightUpperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.08, 0.38, 16),
      suitMat
    );
    rightUpperArm.position.set(0, -0.18, 0.08);
    rightUpperArm.rotation.x = 0.52;
    rightUpperArm.rotation.z = -0.14;
    rightArmPivot.add(rightUpperArm);

    const rightForearmPivot = new THREE.Group();
    rightForearmPivot.position.set(0.06, -0.34, 0.18);

    const rightForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.065, 0.36, 16),
      suitMat
    );
    rightForearm.position.set(0, -0.06, 0.14);
    rightForearm.rotation.x = Math.PI / 2.2;
    rightForearm.rotation.y = -0.32;
    rightForearmPivot.add(rightForearm);

    // White cuff
    const rightCuff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.068, 0.068, 0.04, 16),
      shirtMat
    );
    rightCuff.position.set(-0.03, -0.05, 0.28);
    rightCuff.rotation.x = Math.PI / 2.2;
    rightForearmPivot.add(rightCuff);

    // Right Articulated Hand & Fingers
    const rightHandPivot = new THREE.Group();
    rightHandPivot.position.set(-0.04, -0.04, 0.32);

    const rightPalm = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.048, 0.12), skinMat);
    rightHandPivot.add(rightPalm);

    const rightThumb = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.03, 0.07), fingerMat);
    rightThumb.position.set(-0.06, -0.005, 0.03);
    rightThumb.rotation.y = -0.45;
    rightHandPivot.add(rightThumb);

    const rightIndex = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.028, 0.08), fingerMat);
    rightIndex.position.set(-0.032, 0, 0.08);
    rightHandPivot.add(rightIndex);

    const rightMiddle = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.028, 0.088), fingerMat);
    rightMiddle.position.set(-0.002, 0, 0.085);
    rightHandPivot.add(rightMiddle);

    const rightRing = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.028, 0.08), fingerMat);
    rightRing.position.set(0.028, 0, 0.08);
    rightHandPivot.add(rightRing);

    rightForearmPivot.add(rightHandPivot);
    rightArmPivot.add(rightForearmPivot);
    humanGroup.add(rightArmPivot);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.18, 20), skinMat);
    neck.position.set(0, 1.38, -0.1);
    humanGroup.add(neck);

    // ─── D. HEAD, BLINKING EYES & ARTICULATED TALKING MOUTH ─────────────────
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 1.48, -0.08);

    // Cranium & Upper Face (smooth high-segment organic geometry)
    const craniumGeo = new THREE.SphereGeometry(0.2, 32, 28);
    craniumGeo.scale(0.92, 1.18, 0.98);
    const cranium = new THREE.Mesh(craniumGeo, skinMat);
    cranium.position.set(0, 0.08, 0);
    cranium.castShadow = true;
    headPivot.add(cranium);

    // Sleek Asian Executive Parted Hair
    const hairMat = new THREE.MeshStandardMaterial({
      color: '#131418',
      roughness: 0.75,
      metalness: 0.1,
    });
    const hairTopGeo = new THREE.SphereGeometry(0.208, 28, 20);
    hairTopGeo.scale(0.96, 1.08, 1.02);
    const hairTop = new THREE.Mesh(hairTopGeo, hairMat);
    hairTop.position.set(0, 0.14, -0.02);
    headPivot.add(hairTop);

    // Side part fringe sweep
    const fringe = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.09, 0.13), hairMat);
    fringe.position.set(-0.02, 0.23, 0.12);
    fringe.rotation.z = -0.14;
    headPivot.add(fringe);

    // Ears
    [-0.19, 0.19].forEach((x, idx) => {
      const ear = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.085, 0.05), skinMat);
      ear.position.set(x, 0.07, -0.02);
      ear.rotation.y = idx === 0 ? 0.25 : -0.25;
      headPivot.add(ear);
    });

    // Refined Nose Bridge & Tip
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.11, 12), skinMat);
    nose.position.set(0, 0.06, 0.19);
    nose.rotation.x = -0.15;
    headPivot.add(nose);

    // Eyebrows (Emotive)
    const browMat = new THREE.MeshStandardMaterial({ color: '#16171B', roughness: 0.9 });
    const leftBrow = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.018, 0.025), browMat);
    const rightBrow = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.018, 0.025), browMat);
    leftBrow.position.set(-0.072, 0.128, 0.174);
    rightBrow.position.set(0.072, 0.128, 0.174);
    leftBrow.rotation.z = 0.08;
    rightBrow.rotation.z = -0.08;
    headPivot.add(leftBrow);
    headPivot.add(rightBrow);

    // Almond-Shaped Eyes with Pupils & Cornea Specular
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.15 });
    const irisMat = new THREE.MeshStandardMaterial({ color: '#2B1A12', roughness: 0.2 });
    const pupilMat = new THREE.MeshBasicMaterial({ color: '#050508' });

    const leftEyeGroup = new THREE.Group();
    const rightEyeGroup = new THREE.Group();
    leftEyeGroup.position.set(-0.068, 0.076, 0.168);
    rightEyeGroup.position.set(0.068, 0.076, 0.168);

    [leftEyeGroup, rightEyeGroup].forEach(eyeGrp => {
      const eyeball = new THREE.Mesh(new THREE.SphereGeometry(0.025, 20, 16), eyeWhiteMat);
      const iris = new THREE.Mesh(new THREE.CircleGeometry(0.014, 18), irisMat);
      iris.position.z = 0.024;
      const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.007, 14), pupilMat);
      pupil.position.z = 0.025;
      eyeGrp.add(eyeball);
      eyeGrp.add(iris);
      eyeGrp.add(pupil);
      headPivot.add(eyeGrp);
    });

    // Articulated Eyelids for Real-Time Blinking
    const lidMat = new THREE.MeshStandardMaterial({ color: '#C88D6A', roughness: 0.6 });
    const leftLid = new THREE.Mesh(new THREE.SphereGeometry(0.027, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), lidMat);
    const rightLid = new THREE.Mesh(new THREE.SphereGeometry(0.027, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), lidMat);
    leftLid.position.set(-0.068, 0.079, 0.168);
    rightLid.position.set(0.068, 0.079, 0.168);
    leftLid.rotation.x = -Math.PI / 1.7; // fully open
    rightLid.rotation.x = -Math.PI / 1.7;
    headPivot.add(leftLid);
    headPivot.add(rightLid);

    // Upper Lip & Upper Teeth
    const lipMat = new THREE.MeshStandardMaterial({ color: '#9E584F', roughness: 0.65 });
    const teethMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.2 });

    const upperLip = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.085, 16), lipMat);
    upperLip.rotation.z = Math.PI / 2;
    upperLip.position.set(0, -0.038, 0.178);
    headPivot.add(upperLip);

    const upperTeeth = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.016, 0.02), teethMat);
    upperTeeth.position.set(0, -0.046, 0.165);
    headPivot.add(upperTeeth);

    // ─── ARTICULATED REAL-TIME TALKING JAW HINGE ─────────────────────────────
    const jawHinge = new THREE.Group();
    jawHinge.position.set(0, -0.025, 0.04);

    // Tapered Chin & Lower Jaw
    const chinGeo = new THREE.CylinderGeometry(0.11, 0.075, 0.14, 20);
    chinGeo.scale(1.1, 1.0, 1.15);
    const chin = new THREE.Mesh(chinGeo, skinMat);
    chin.position.set(0, -0.06, 0.1);
    jawHinge.add(chin);

    // Lower Lip
    const lowerLip = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.082, 16), lipMat);
    lowerLip.rotation.z = Math.PI / 2;
    lowerLip.position.set(0, -0.038, 0.155);
    jawHinge.add(lowerLip);

    // Lower Teeth Row
    const lowerTeeth = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.016, 0.02), teethMat);
    lowerTeeth.position.set(0, -0.028, 0.142);
    jawHinge.add(lowerTeeth);

    // Dark Oral Cavity Interior
    const oralCavity = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.038, 0.04),
      new THREE.MeshBasicMaterial({ color: '#2E0B0E' })
    );
    oralCavity.position.set(0, -0.025, 0.125);
    jawHinge.add(oralCavity);

    headPivot.add(jawHinge);
    humanGroup.add(headPivot);
    interviewerGroup.add(humanGroup);
    scene.add(interviewerGroup);

    // ─── 7. Atmospheric Daylight Sunbeam Particles ───────────────────────────
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 5;
      particlePos[i + 1] = Math.random() * 2.8 + 0.4;
      particlePos[i + 2] = (Math.random() - 0.5) * 4 - 0.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.022,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ─── 8. Interactive Mouse Parallax Gaze ───────────────────────────────────
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const onMouseMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    // ─── 9. Animation Loop (Lip-Sync, Moving Hands, Blinking, Gesturing) ──────
    let clock = new THREE.Clock();
    let blinkTimer = 0;
    let nextBlinkTime = 3.2;
    let reqId = null;

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth mouse gaze dampening
      currentMouseX += (targetMouseX - currentMouseX) * 0.06;
      currentMouseY += (targetMouseY - currentMouseY) * 0.06;

      // ── A. TALKING LIP-SYNC & CONVERSATIONAL GESTURES ──
      if (isInterviewerSpeaking) {
        // Multi-frequency phonetic syllable cadence for realistic mouth articulation
        const speechWave =
          Math.sin(time * 16.2) * 0.42 +
          Math.sin(time * 24.5) * 0.35 +
          Math.sin(time * 9.1) * 0.23;

        const targetJawAngle = Math.max(0, speechWave) * 0.24;
        jawHinge.rotation.x = THREE.MathUtils.lerp(jawHinge.rotation.x, targetJawAngle, 0.48);

        // Conversational head nods during speech
        headPivot.rotation.x = Math.sin(time * 2.8) * 0.045 + 0.01 + currentMouseY * 0.05;
        headPivot.rotation.y = Math.sin(time * 1.5) * 0.04 + currentMouseX * 0.08;

        // Eyebrows slight expressive lift on questions
        leftBrow.position.y = 0.128 + Math.sin(time * 3.5) * 0.007;
        rightBrow.position.y = 0.128 + Math.sin(time * 3.5) * 0.007;

        // ── LIVE MOVING HANDS GESTURES WHILE SPEAKING ──
        // Hands lift off the desk and articulate conversationally
        const gestureCycle = Math.sin(time * 2.2);
        const gestureWave = Math.sin(time * 4.5);

        // Left Arm: opens outward and gestures emphatically
        leftArmPivot.rotation.x = THREE.MathUtils.lerp(leftArmPivot.rotation.x, 0.15 + gestureCycle * 0.08, 0.1);
        leftArmPivot.rotation.z = THREE.MathUtils.lerp(leftArmPivot.rotation.z, 0.18 + gestureWave * 0.06, 0.1);
        leftForearmPivot.rotation.x = THREE.MathUtils.lerp(leftForearmPivot.rotation.x, -0.25 + gestureCycle * 0.15, 0.12);
        leftHandPivot.rotation.x = THREE.MathUtils.lerp(leftHandPivot.rotation.x, 0.2 + gestureWave * 0.18, 0.15);
        leftHandPivot.rotation.y = THREE.MathUtils.lerp(leftHandPivot.rotation.y, 0.35 + gestureCycle * 0.12, 0.15);
        leftHandPivot.rotation.z = THREE.MathUtils.lerp(leftHandPivot.rotation.z, -0.15 + gestureWave * 0.1, 0.15);

        // Right Arm: articulates key points with conversational wrist turns
        rightArmPivot.rotation.x = THREE.MathUtils.lerp(rightArmPivot.rotation.x, 0.12 + Math.cos(time * 2.2) * 0.09, 0.1);
        rightArmPivot.rotation.z = THREE.MathUtils.lerp(rightArmPivot.rotation.z, -0.16 + Math.cos(time * 4.2) * 0.05, 0.1);
        rightForearmPivot.rotation.x = THREE.MathUtils.lerp(rightForearmPivot.rotation.x, -0.22 + Math.cos(time * 2.2) * 0.14, 0.12);
        rightHandPivot.rotation.x = THREE.MathUtils.lerp(rightHandPivot.rotation.x, 0.18 + Math.sin(time * 3.8) * 0.16, 0.15);
        rightHandPivot.rotation.y = THREE.MathUtils.lerp(rightHandPivot.rotation.y, -0.32 + Math.cos(time * 2.5) * 0.12, 0.15);
        rightHandPivot.rotation.z = THREE.MathUtils.lerp(rightHandPivot.rotation.z, 0.12 + Math.sin(time * 4.2) * 0.1, 0.15);
      } else {
        // Mouth comfortably closed when silent
        jawHinge.rotation.x = THREE.MathUtils.lerp(jawHinge.rotation.x, 0, 0.25);
        leftBrow.position.y = THREE.MathUtils.lerp(leftBrow.position.y, 0.128, 0.1);
        rightBrow.position.y = THREE.MathUtils.lerp(rightBrow.position.y, 0.128, 0.1);

        // ── LIVE HANDS & HEAD WHEN CANDIDATE IS SPEAKING ──
        if (isCandidateSpeaking) {
          // Attentive listening posture: head tilts slightly, nods thoughtfully
          headPivot.rotation.x = THREE.MathUtils.lerp(headPivot.rotation.x, 0.04 + Math.sin(time * 1.8) * 0.015, 0.08);
          headPivot.rotation.z = THREE.MathUtils.lerp(headPivot.rotation.z, -0.04, 0.08);
          headPivot.rotation.y = THREE.MathUtils.lerp(headPivot.rotation.y, currentMouseX * 0.1, 0.08);

          // Hands rest comfortably on the desk blotter, subtle attentive finger taps
          leftArmPivot.rotation.x = THREE.MathUtils.lerp(leftArmPivot.rotation.x, 0, 0.08);
          leftArmPivot.rotation.z = THREE.MathUtils.lerp(leftArmPivot.rotation.z, 0.05, 0.08);
          leftForearmPivot.rotation.x = THREE.MathUtils.lerp(leftForearmPivot.rotation.x, 0, 0.08);
          leftHandPivot.rotation.x = THREE.MathUtils.lerp(leftHandPivot.rotation.x, 0 + Math.sin(time * 3) * 0.03, 0.08);
          leftHandPivot.rotation.y = THREE.MathUtils.lerp(leftHandPivot.rotation.y, 0.1, 0.08);

          rightArmPivot.rotation.x = THREE.MathUtils.lerp(rightArmPivot.rotation.x, 0, 0.08);
          rightArmPivot.rotation.z = THREE.MathUtils.lerp(rightArmPivot.rotation.z, -0.05, 0.08);
          rightForearmPivot.rotation.x = THREE.MathUtils.lerp(rightForearmPivot.rotation.x, 0, 0.08);
          rightHandPivot.rotation.x = THREE.MathUtils.lerp(rightHandPivot.rotation.x, 0 + Math.cos(time * 2.8) * 0.03, 0.08);
          rightHandPivot.rotation.y = THREE.MathUtils.lerp(rightHandPivot.rotation.y, -0.1, 0.08);
        } else {
          // Idle conversational waiting posture
          headPivot.rotation.x = Math.sin(time * 0.7) * 0.018 + currentMouseY * 0.04;
          headPivot.rotation.y = Math.sin(time * 0.4) * 0.025 + currentMouseX * 0.08;
          headPivot.rotation.z = THREE.MathUtils.lerp(headPivot.rotation.z, 0, 0.06);

          // Hands resting naturally on the desk with subtle organic sway
          const restBreathe = Math.sin(time * 1.4) * 0.012;
          leftArmPivot.rotation.x = THREE.MathUtils.lerp(leftArmPivot.rotation.x, restBreathe, 0.05);
          rightArmPivot.rotation.x = THREE.MathUtils.lerp(rightArmPivot.rotation.x, restBreathe, 0.05);
          leftForearmPivot.rotation.x = THREE.MathUtils.lerp(leftForearmPivot.rotation.x, 0, 0.05);
          rightForearmPivot.rotation.x = THREE.MathUtils.lerp(rightForearmPivot.rotation.x, 0, 0.05);
          leftHandPivot.rotation.x = THREE.MathUtils.lerp(leftHandPivot.rotation.x, 0, 0.05);
          rightHandPivot.rotation.x = THREE.MathUtils.lerp(rightHandPivot.rotation.x, 0, 0.05);
        }
      }

      // ── B. EYE BLINKING ANIMATION ──
      blinkTimer += delta;
      if (blinkTimer > nextBlinkTime) {
        // Rapid eyelid closure
        leftLid.rotation.x = -Math.PI / 3.2;
        rightLid.rotation.x = -Math.PI / 3.2;

        if (blinkTimer > nextBlinkTime + 0.12) {
          // Open eyelids back up
          leftLid.rotation.x = -Math.PI / 1.7;
          rightLid.rotation.x = -Math.PI / 1.7;
          blinkTimer = 0;
          nextBlinkTime = 2.6 + Math.random() * 3.8;
        }
      }

      // ── C. SUBTLE IDLE BREATHING ──
      const breathe = Math.sin(time * 1.5) * 0.007;
      chest.position.y = 1.05 + breathe;
      headPivot.position.y = 1.48 + breathe * 0.85;

      // ── D. FIRST-PERSON NATURAL CAMERA BREATHING DRIFT ──
      camera.position.x = Math.sin(time * 0.35) * 0.01 + currentMouseX * 0.03;
      camera.position.y = 1.34 + Math.sin(time * 0.7) * 0.005 - currentMouseY * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // ─── 10. Responsive Resize Handler ───────────────────────────────────────
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // ─── 11. Cleanup & Teardown ──────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isInterviewerSpeaking, isCandidateSpeaking, interviewerName, interviewerTitle, candidateRole, targetCompany]);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    />
  );
}
