"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { LaserBeams } from "./laser-beams";
import { heroPointer } from "./hero-pointer";
import { TIER_SETTINGS, type LaserTier } from "./use-laser-tier";

const RIG_YAW = 0.045;
const RIG_PITCH = 0.03;
const RIG_DAMP = 3.2;

/**
 * Wraps the rig so it leans toward the cursor as a unit. Kept deliberately
 * tiny - the beams are several world units long, so even 0.045rad swings their
 * far ends noticeably.
 */
function Rig({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    group.rotation.y = THREE.MathUtils.damp(
      group.rotation.y,
      heroPointer.x * RIG_YAW,
      RIG_DAMP,
      delta
    );
    group.rotation.x = THREE.MathUtils.damp(
      group.rotation.x,
      -heroPointer.y * RIG_PITCH,
      RIG_DAMP,
      delta
    );
  });

  return <group ref={groupRef}>{children}</group>;
}

export function LaserHeroScene({
  active,
  tier,
  cutoffRatio,
  bandRatio,
}: {
  active: boolean;
  tier: LaserTier;
  /** Where the beams are fully gone, as a fraction of hero height from the top. */
  cutoffRatio: number;
  /** Height of the fade band above that line, as a fraction of hero height. */
  bandRatio: number;
}) {
  const settings = TIER_SETTINGS[tier === "reduced" ? "reduced" : "full"];
  // NDC spans 2 units over the hero's height, hence the doubling on both.
  const cutoffNdc = 1 - 2 * cutoffRatio;
  const cutoffBand = 2 * bandRatio;

  return (
    <Canvas
      dpr={settings.dpr}
      camera={{ position: [0, 0, 5], fov: 50 }}
      frameloop={active ? "always" : "never"}
      // alpha:true composites the rig over the page background. The beams write
      // premultiplied linear light, which resolves correctly against the near
      // black hero; it would need revisiting if the hero ever went light.
      //
      // toneMapping must be set explicitly: R3F defaults to ACES, and on the
      // reduced tier (no composer) the shaders' tonemapping_fragment would then
      // apply it and grey out the saturated brand hues. With the composer
      // mounted this is overridden to NoToneMapping and the pass handles it.
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "low-power",
        toneMapping: THREE.NeutralToneMapping,
      }}
      style={{ pointerEvents: "none" }}
    >
      <Rig>
        <LaserBeams
          count={settings.beamCount}
          opacity={0.95}
          coreGain={settings.coreGain}
          haloGain={settings.haloGain}
          lookBars={settings.lookBars}
          cutoffNdc={cutoffNdc}
          cutoffBand={cutoffBand}
        />
      </Rig>

      {settings.bloom ? (
        <EffectComposer multisampling={0}>
          {/* Threshold sits just under 1.0 so only the HDR beam cores bloom.
              The coloured halo is drawn analytically in the shader and must
              pass through untouched - blooming it is what made the old rig
              read as fuzz. */}
          {/* Small radius on purpose. A wide bloom is exactly the fuzz this
              rebuild is trying to avoid - the glow around each beam is drawn
              analytically in the shader, so bloom only has to add the halation
              around the hottest cores. */}
          <Bloom
            mipmapBlur
            luminanceThreshold={0.95}
            luminanceSmoothing={0.05}
            radius={0.32}
            intensity={0.75}
          />
          {/* NEUTRAL compresses only the top end, so stacked cores roll off
              toward hue instead of clipping to white. ACES would grey out the
              saturated brand hues outright. */}
          <ToneMapping mode={ToneMappingMode.NEUTRAL} />
        </EffectComposer>
      ) : null}
    </Canvas>
  );
}
