export const beamVertexShader = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSeed;
  attribute float aIntensity;

  varying vec2 vUv;
  varying vec3 vColor;
  varying float vSeed;
  varying float vIntensity;
  varying vec4 vClip;

  void main() {
    vUv = uv;
    vColor = aColor;
    vSeed = aSeed;
    vIntensity = aIntensity;

    // Dead straight. A laser is a rigid rod of light - the sway that used to
    // live here is what made these read as ribbons rather than beams.
    vec4 clip = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    vClip = clip;
    gl_Position = clip;
  }
`;

export const beamFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uQuadWidth;
  uniform float uCoreSigma;
  uniform float uHaloSigma;
  uniform float uCoreGain;
  uniform float uHaloGain;
  uniform float uSourceGain;
  uniform float uAtten;
  uniform float uCutoffNdc;
  uniform float uCutoffBand;

  varying vec2 vUv;
  varying vec3 vColor;
  varying float vSeed;
  varying float vIntensity;
  varying vec4 vClip;

  void main() {
    // World-space distance from the beam axis. Because the profile below is an
    // analytic function of this, the edges antialias themselves - which is what
    // lets the canvas keep antialias:false.
    float x = (vUv.x - 0.5) * uQuadWidth;

    // Tight gaussian core plus an exponential halo. Exponential rather than
    // gaussian for the halo is the whole trick: the long thin tail is what the
    // eye reads as "laser through haze" instead of "blurry line".
    float core = exp(-(x * x) / (uCoreSigma * uCoreSigma));
    float halo = exp(-abs(x) / uHaloSigma);

    float head = smoothstep(0.0, 0.03, vUv.y);        // hides the emitter's hard edge
    float atten = exp(-vUv.y * uAtten);                // atmosphere; deliberately no tip fade
    float source = exp(-vUv.y * 26.0) * uSourceGain;   // flare at the fixture
    float scint = 0.94 + 0.06 * sin(uTime * 3.1 + vSeed * 21.0); // temporal only, never spatial

    // Additive blending resolves to colour * alpha, so alpha carries the beam's
    // cross-section and the colour carries the energy. Keeping the two separate
    // is what lets the core run hot (above 1.0, for bloom to catch) while the
    // coverage the page composites against stays properly clamped.
    // Screen-space cutoff. The layer also carries a CSS mask, but an ancestor
    // mask does not reliably clip a composited WebGL canvas in Chrome, so the
    // rig has to stop drawing below the portrait itself. Dividing the
    // interpolated clip position gives the true per-fragment screen Y.
    float ndcY = vClip.y / vClip.w;
    float bottomFade = smoothstep(uCutoffNdc, uCutoffNdc + uCutoffBand, ndcY);

    float shape = (halo * uHaloGain + core) * head * atten * vIntensity * uOpacity * scint * bottomFade;

    // The halo keeps the hue and only the innermost pixels desaturate. That
    // split is the fix for additive blowout: overlapping halos accumulate
    // colour, and only the few-pixel cores can ever stack toward white.
    vec3 color = mix(vColor, vec3(1.0), clamp(core * 1.2, 0.0, 1.0));
    color *= 1.0 + core * (uCoreGain - 1.0) + core * source;

    gl_FragColor = vec4(color, clamp(shape, 0.0, 1.0));

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
