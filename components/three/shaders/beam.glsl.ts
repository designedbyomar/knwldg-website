export const beamVertexShader = /* glsl */ `
  attribute float aColorMix;
  attribute float aSeed;

  uniform float uTime;

  varying vec2 vUv;
  varying float vColorMix;
  varying float vSeed;

  void main() {
    vUv = uv;
    vColorMix = aColorMix;
    vSeed = aSeed;

    vec3 pos = position;
    // Organic sway that grows toward the beam tip, anchored (0 sway) at the base.
    float sway = sin(uv.y * 3.0 + uTime * 0.45 + aSeed * 6.283) * 0.16 * uv.y;
    pos.x += sway;

    vec4 transformed = instanceMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * transformed;
  }
`;

export const beamFragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uTime;
  uniform float uOpacity;

  varying vec2 vUv;
  varying float vColorMix;
  varying float vSeed;

  void main() {
    float core = pow(max(0.0, 1.0 - abs(vUv.x - 0.5) * 2.0), 1.5);
    float lengthFade = smoothstep(1.0, 0.12, vUv.y) * smoothstep(0.0, 0.06, vUv.y);
    float flicker = sin(vUv.y * 30.0 + uTime * 2.6 + vSeed * 10.0) * 0.12 + 0.88;

    float alpha = core * lengthFade * flicker * uOpacity;
    vec3 color = mix(uColorA, uColorB, vColorMix);

    gl_FragColor = vec4(color, alpha);
  }
`;
