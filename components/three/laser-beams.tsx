"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { beamVertexShader, beamFragmentShader } from "./shaders/beam.glsl";
import { BRAND_RAMP_LINEAR } from "@/data/theme-tokens";
import { getLaserBeat } from "./laser-clock";
import { sampleBeam, type BeamPose } from "./laser-choreography";

// Sits behind the portrait's upper body, above the band where the CSS mask
// starts fading the layer out - otherwise the brightest part of every beam
// (the emitter flare) lands in the fade and the fan reads washed out.
//
// This is low on purpose: the fan wants to radiate from behind his chest, not
// from over his head. It was briefly raised to 0.95 to clear a much taller fade
// band; the band was relaxed instead (see LASER_FADE_START_PX) and the black
// floor scrim took over the job of hiding beams behind his dissolving lower
// half, which is what lets the emitter sit back down here.
export const ANCHOR = new THREE.Vector3(0, 0.15, -1.2);
/** Deepest plane a beam can occupy once z-jitter is applied. */
const BEAM_PLANE_Z = ANCHOR.z - 0.4;
const BEAM_OVERSHOOT = 1.12;

const BEAM_QUAD_WIDTH = 0.26;
const BEAM_CORE_SIGMA = 0.005;
const BEAM_HALO_SIGMA = 0.022;
const BEAM_SOURCE_GAIN = 1.4;
// Very light: beams have to still read at the frame edges, so this is a hint
// of atmosphere rather than a falloff.
const BEAM_ATTEN = 0.18;

const dummy = new THREE.Object3D();
const pose: BeamPose = { angle: 0, intensity: 0 };

type LaserBeamsProps = {
  count: number;
  opacity?: number;
  coreGain: number;
  haloGain: number;
  lookBars: number;
  /** Screen Y where the rig stops drawing, in NDC (+1 top, -1 bottom). */
  cutoffNdc: number;
  /** Height of the fade band above that line, in NDC units. */
  cutoffBand: number;
};

export function LaserBeams({
  count,
  opacity = 1,
  coreGain,
  haloGain,
  lookBars,
  cutoffNdc,
  cutoffBand,
}: LaserBeamsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const camera = useThree((state) => state.camera);
  const viewport = useThree((state) => state.viewport);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(BEAM_QUAD_WIDTH, 1, 1, 1);
    geo.translate(0, 0.5, 0); // pivot at the base, spans y 0..1

    const colors = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const intensities = new Float32Array(count).fill(1);

    for (let i = 0; i < count; i++) {
      // Walk the full ramp across the fan so every brand hue appears and the
      // spread stays symmetric.
      const t = count === 1 ? 0.5 : i / (count - 1);
      const stop = Math.round(t * (BRAND_RAMP_LINEAR.length - 1));
      colors.set(BRAND_RAMP_LINEAR[stop], i * 3);
      seeds[i] = (i * 0.173 + 0.11) % 1;
    }

    geo.setAttribute("aColor", new THREE.InstancedBufferAttribute(colors, 3));
    geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1));
    geo.setAttribute("aIntensity", new THREE.InstancedBufferAttribute(intensities, 1));

    return geo;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: opacity },
      uQuadWidth: { value: BEAM_QUAD_WIDTH },
      uCoreSigma: { value: BEAM_CORE_SIGMA },
      uHaloSigma: { value: BEAM_HALO_SIGMA },
      uCoreGain: { value: coreGain },
      uHaloGain: { value: haloGain },
      uSourceGain: { value: BEAM_SOURCE_GAIN },
      uAtten: { value: BEAM_ATTEN },
      uCutoffNdc: { value: cutoffNdc },
      uCutoffBand: { value: cutoffBand },
    }),
    // Values are pushed per-frame below; this only builds the initial object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  /**
   * Distance from the anchor to the far corner of the frame, so beams leave the
   * viewport at every aspect ratio instead of stopping somewhere inside it.
   */
  const reach = useMemo(() => {
    const view = viewport.getCurrentViewport(camera, [0, 0, BEAM_PLANE_Z]);
    return (
      Math.hypot(
        view.width / 2 + Math.abs(ANCHOR.x),
        view.height / 2 + Math.abs(ANCHOR.y)
      ) * BEAM_OVERSHOOT
    );
  }, [viewport, camera]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const beat = getLaserBeat();
    const intensityAttribute = geometry.getAttribute(
      "aIntensity"
    ) as THREE.InstancedBufferAttribute;

    if (materialRef.current) {
      const u = materialRef.current.uniforms;
      u.uTime.value = beat;
      u.uOpacity.value = opacity;
      u.uCoreGain.value = coreGain;
      u.uHaloGain.value = haloGain;
      u.uCutoffNdc.value = cutoffNdc;
      u.uCutoffBand.value = cutoffBand;
    }

    for (let i = 0; i < count; i++) {
      sampleBeam(i, count, beat, pose, lookBars);

      dummy.position.set(ANCHOR.x, ANCHOR.y, ANCHOR.z + ((i % 3) - 1) * 0.35);
      dummy.rotation.set(0, 0, pose.angle);
      dummy.scale.set(1, reach, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      intensityAttribute.setX(i, pose.intensity);
    }

    mesh.instanceMatrix.needsUpdate = true;
    intensityAttribute.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      // key forces a fresh mesh when the tier changes the instance count
      key={count}
      args={[geometry, undefined, count]}
      frustumCulled={false}
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={beamVertexShader}
        fragmentShader={beamFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}
