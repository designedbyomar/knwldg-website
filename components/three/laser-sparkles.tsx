"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 50;

// Randomized once at module-evaluation time, not during render - see
// laser-beams.tsx for why this lives outside the component body.
function createSparklePositions(): Float32Array {
  const positions = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 4;
    positions[i * 3 + 1] = 0.8 + (Math.random() - 0.5) * 3;
    positions[i * 3 + 2] = -0.3 + (Math.random() - 0.5) * 2;
  }
  return positions;
}
const SPARKLE_POSITIONS = createSparklePositions();

/**
 * Hand-rolled dust-in-light specks, standing in for drei's <Sparkles> so this
 * scene doesn't have to pull in drei's whole barrel export for one effect.
 */
export function LaserSparkles() {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(SPARKLE_POSITIONS, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.025}
        color="#c9a3ff"
        transparent
        opacity={0.35}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
