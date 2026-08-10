# Verifying visual work

The hero animates, uses WebGL, and blends. All three defeat the obvious ways of
checking whether a change worked. Every rule below exists because the obvious
approach already produced a confidently wrong answer in this repo.

## 1. Headless has no WebGL2 — you are probably looking at the fallback

The headless browser used for screenshots here reports `webgl2: false`. That
makes `useLaserTier()` return `"off"`, so `LaserHeroSceneLoader` never mounts the
scene and the only beams on screen are the static CSS fallback. Screenshots look
plausible, which is the problem.

An entire verification pass was once reported as "beams measured across the full
look cycle" when the rig had never mounted.

Before trusting any screenshot of the hero, confirm:

```js
!!document.createElement('canvas').getContext('webgl2')   // true
!!document.querySelector('#hero canvas')                  // true
document.querySelector('#hero').dataset.laser             // "live"
getComputedStyle(document.querySelector('.laser-fallback')).opacity  // "0"
```

If any of those are wrong, use a GPU-backed browser (`browse connect` launches a
headed Chromium) and check again. Disconnect when done.

## 2. One frame is not evidence

The hero's colour at any point depends on where the two spotlights currently are,
where the strobe is in its cycle, and which look the beams are in. Comparing one
screenshot of build A against one of build B measures the phase difference, not
the change.

This produced a "38% regression" that became a different number entirely when
measured properly, and a proposed fix for a mechanism that turned out not to be
the cause.

Instead:

- Capture 6–10 frames spaced across the relevant cycle. The spot path repeats
  every `SPOT_LOOP_BARS` (12 bars, ~21.8s) and the look sequence every ~43.6s.
- Report a **mean and a range**, and say how many frames.
- Watch for aliasing: fixed capture intervals can beat against the 14.6s strobe
  period and the 21.8s spot loop. If your per-frame values look bimodal, suspect
  your sampling before you suspect the build.

## 3. Prefer a measurement, and say which you used

"Looks better" is not reportable. Pixel probes on saved PNGs are cheap — Pillow
is available. Useful ones already used here:

- Luminance profile down the portrait's centre column, to confirm the fade is
  monotonic and reaches the page background.
- Per-pixel variance across frames inside a region, to detect animated light
  leaking through something that should be opaque.
- Region colour means restricted to pixels above a luminance threshold, to
  sample "pixels on the wordmark" rather than "pixels near it".

When you do eyeball something, say so. Don't dress an impression as a metric.

## 4. Re-measure the flash rate whenever the strobe changes

This is the one check that is safety-critical rather than cosmetic. WCAG 2.3.1
allows no more than three flashes in any one-second period.

Sample the disc's inline `opacity` at display rate for ~32s (two full strobe
periods), count `0 → non-zero` transitions, and assert that no more than three
begin within any one-second window. Guard the sampler with a generation token —
a stale loop from an earlier run will otherwise write into the same array and
end the wait early.

Verify the maths in Node as well as the browser; they should agree.

## 5. State what you could not test

`Emulation.setEmulatedMedia` is blocked by the browse CDP allowlist, so
`prefers-reduced-motion` cannot be emulated. That path is verifiable only by
reading the code. Report it as inspection, not as a test.

Similarly, if the dev server was already running with stale state, or you
sampled fewer frames than the cycle needs, say that rather than rounding up to
"verified".
