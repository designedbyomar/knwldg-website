"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { LaserBeams } from "./laser-beams";
import { LaserSparkles } from "./laser-sparkles";

export function LaserHeroScene({ active }: { active: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5], fov: 50 }}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      style={{ pointerEvents: "none" }}
    >
      <LaserBeams opacity={0.75} />
      <LaserSparkles />
      <EffectComposer multisampling={0}>
        <Bloom
          mipmapBlur
          luminanceThreshold={0.25}
          luminanceSmoothing={0.3}
          radius={0.6}
          intensity={0.8}
        />
      </EffectComposer>
    </Canvas>
  );
}
