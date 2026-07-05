/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';
import './Lanyard.css';

extend({ MeshLineGeometry, MeshLineMaterial });

export default function Lanyard({
  position = [0, 0, 10],
  gravity = [0, -4, 0], // Lighter gravity so it sways slowly and softly
  fov = 24,
  transparent = true,
}) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position: position, fov: fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent, antialias: true }}
      >
        <ambientLight intensity={Math.PI} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band isMobile={isMobile} />
        </Physics>
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
}) {
  const band = useRef(),
    fixed = useRef(),
    j1 = useRef(),
    j2 = useRef(),
    j3 = useRef(),
    card = useRef();

  const vec = new THREE.Vector3(),
    ang = new THREE.Vector3(),
    rot = new THREE.Vector3(),
    dir = new THREE.Vector3();

  // Damping reduced to 2 so it moves naturally, lightly, and smoothly when dragged
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 2, linearDamping: 2 };

  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);

  // Generate ID Card Textures Programmatically
  const textures = useMemo(() => {
    const createTexture = (isBack) => {
      const canvas = document.createElement('canvas');
      // Doubled canvas dimensions (1024x1536) for ultra-sharp high-definition rendering
      canvas.width = 1024;
      canvas.height = 1536;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      if (!isBack) {
        // --- FRONT SIDE ---
        // Background - Pure White for maximum contrast
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header dark forest green banner
        ctx.fillStyle = '#2E3A32';
        ctx.fillRect(0, 0, canvas.width, 200);

        // Header slot hole outline
        ctx.fillStyle = '#FAFAF7';
        ctx.beginPath();
        ctx.roundRect(canvas.width / 2 - 80, 40, 160, 32, 16);
        ctx.fill();

        // Header text - Pure White for readability
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 44px "Cormorant Garamond", serif';
        ctx.textAlign = 'center';
        ctx.fillText('SMK TELKOM SIDOARJO', canvas.width / 2, 148);

        // Name, Class, Dept details - Made much larger and bolder
        ctx.fillStyle = '#101612';
        ctx.font = '900 92px "Lora", serif';
        ctx.fillText('N. Sufiatuz Zahro', canvas.width / 2, 980);

        // Role tag background - Dark Green for high contrast
        ctx.fillStyle = '#2E3A32';
        ctx.beginPath();
        ctx.roundRect(canvas.width / 2 - 160, 1052, 320, 72, 36);
        ctx.fill();

        // Role tag text - White on Dark Green
        ctx.fillStyle = '#FAFAF7';
        ctx.font = 'bold 40px "Cormorant Garamond", serif';
        ctx.fillText('STUDENT', canvas.width / 2, 1102);

        // Dept text - Darker green for readability
        ctx.fillStyle = '#2E3A32';
        ctx.font = 'bold 48px "Lora", serif';
        ctx.fillText('SIJA — CLASS XII', canvas.width / 2, 1230);
      } else {
        // --- BACK SIDE ---
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#D8EFE0');
        gradient.addColorStop(1, '#A8D5BA');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Diagonal Text Patterns
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 6);
        ctx.fillStyle = 'rgba(46, 58, 50, 0.12)';
        ctx.textAlign = 'center';

        ctx.font = '800 128px "Cormorant Garamond", sans-serif';
        ctx.fillText('SIJA', 0, -240);
        ctx.fillText('CLOUD', 0, -60);
        ctx.fillText('NETWORK', 0, 120);
        ctx.fillText('SECURE', 0, 300);
        ctx.restore();
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 16;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return tex;
    };

    const front = createTexture(false);
    const back = createTexture(true);

    return { front, back };
  }, []);

  // Load avatar image and draw it onto the front texture once loaded
  useEffect(() => {
    const avatar = new Image();
    avatar.src = '/assets/images/profile.png';
    avatar.onload = () => {
      const tex = textures.front;
      const canvas = tex.image;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clip circle (Larger radius = 270)
        ctx.save();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 580, 270, 0, Math.PI * 2);
        ctx.clip();
        
        // Draw profile image (Larger size = 540x540)
        ctx.drawImage(avatar, canvas.width / 2 - 270, 310, 540, 540);
        ctx.restore();

        // Draw green border around profile image
        ctx.strokeStyle = '#A8D5BA';
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 580, 270, 0, Math.PI * 2);
        ctx.stroke();

        tex.needsUpdate = true;
      }
    };
  }, [textures]);

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 0.75]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 0.75]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 0.75]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.1, 0] // Connected exactly to the top slot of the card
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (fixed.current) {
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';

  return (
    <>
      <group position={[0, 3, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.3, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.08]} />
        </RigidBody>
        <RigidBody position={[0.6, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.08]} />
        </RigidBody>
        <RigidBody position={[0.9, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.08]} />
        </RigidBody>
        
        <RigidBody position={[1.2, -1.1, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.75, 1.1, 0.02]} />
          
          <group
            scale={1.0}
            position={[0, 0, 0]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={e => { e.stopPropagation(); drag(false); }}
            onPointerDown={e => {
              e.stopPropagation();
              e.target.setPointerCapture(e.pointerId);
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
            }}
          >
            {/* The 3D Rounded ID Card mesh */}
            <mesh>
              <boxGeometry args={[1.5, 2.2, 0.04]} />
              {/* Materials for the 6 faces of the box geometry */}
              <meshPhysicalMaterial attach="material-0" color="#b2bec3" roughness={0.3} metalness={0.8} />
              <meshPhysicalMaterial attach="material-1" color="#b2bec3" roughness={0.3} metalness={0.8} />
              <meshPhysicalMaterial attach="material-2" color="#b2bec3" roughness={0.3} metalness={0.8} />
              <meshPhysicalMaterial attach="material-3" color="#b2bec3" roughness={0.3} metalness={0.8} />
              <meshPhysicalMaterial attach="material-4" map={textures.front} roughness={0.6} metalness={0.2} />
              <meshPhysicalMaterial attach="material-5" map={textures.back} roughness={0.6} metalness={0.2} />
            </mesh>
            
            {/* Slot Hole Clip */}
            <mesh position={[0, 1.1, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} rotation={[Math.PI / 2, 0, 0]} />
              <meshPhysicalMaterial color="#b2bec3" roughness={0.2} metalness={0.9} />
            </mesh>
          </group>
        </RigidBody>
      </group>

      {/* Lanyard Strap MeshLine */}
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="#A8D5BA"
          depthTest={true}
          resolution={isMobile ? [800, 1600] : [1000, 1000]}
          lineWidth={0.06}
        />
      </mesh>
    </>
  );
}
