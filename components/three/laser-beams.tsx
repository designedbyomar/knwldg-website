"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { beamVertexShader, beamFragmentShader } from "./shaders/beam.glsl";
import { BRAND_MAGENTA_RGB, BRAND_VIOLET_RGB } from "@/data/theme-tokens";

const BEAM_COUNT = 6;
const BEAM_LENGTH = 3.8;
const BEAM_WIDTH = 0.1;
const ANCHOR = new THREE.Vector3(0, 1.35, -0.4);

type BeamInstance = {
  baseAngle: number;
  swaySpeed: number;
  swayAmount: number;
  phase: number;
  length: number;
};

const dummy = new THREE.Object3D();

// Randomized once at module-evaluation time, not during render - the exact
// values never need to change, and generating them here (rather than in a
// useMemo factory) keeps component render bodies pure for the React Compiler.
function createInstanceConfigs(): BeamInstance[] {
  return Array.from({ length: BEAM_COUNT }, (_, i) => {
    const t = i / (BEAM_COUNT - 1);
    return {
      baseAngle: Math.PI + (t - 0.5) * 1.7,
      swaySpeed: 0.25 + Math.random() * 0.2,
      swayAmount: 0.12 + Math.random() * 0.1,
      phase: Math.random() * Math.PI * 2,
      length: BEAM_LENGTH * (0.85 + Math.random() * 0.3),
    };
  });
}
const INSTANCE_CONFIGS = createInstanceConfigs();

function createSeeds(): Float32Array {
  const seed = new Float32Array(BEAM_COUNT);
  for (let i = 0; i < BEAM_COUNT; i++) seed[i] = Math.random();
  return seed;
}
const SEED_VALUES = createSeeds();

export function LaserBeams({ opacity = 1 }: { opacity?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const instances = INSTANCE_CONFIGS;

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(BEAM_WIDTH, 1, 1, 24);
    geo.translate(0, 0.5, 0);

    const colorMix = new Float32Array(BEAM_COUNT);
    for (let i = 0; i < BEAM_COUNT; i++) colorMix[i] = i / (BEAM_COUNT - 1);

    geo.setAttribute("aColorMix", new THREE.InstancedBufferAttribute(colorMix, 1));
    geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(SEED_VALUES, 1));

    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(...BRAND_MAGENTA_RGB) },
      uColorB: { value: new THREE.Color(...BRAND_VIOLET_RGB) },
      uOpacity: { value: opacity },
    }),
    [opacity]
  );

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const time = clock.getElapsedTime();
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uOpacity.value = opacity;
    }

    instances.forEach((inst, i) => {
      const angle = inst.baseAngle + Math.sin(time * inst.swaySpeed + inst.phase) * inst.swayAmount;
      dummy.position.copy(ANCHOR);
      dummy.rotation.set(0, 0, angle);
      dummy.scale.set(1, inst.length, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, BEAM_COUNT]} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={beamVertexShader}
        fragmentShader={beamFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}
