@AGENTS.md

<!--
Claude Code specific. Everything vendor-neutral belongs in AGENTS.md, which the
line above imports and which Cursor, Codex and others also read.
-->

## Skill routing

When the user's request matches an available skill, invoke it via the Skill
tool. When in doubt, invoke the skill.

- Product ideas / brainstorming → `/office-hours`
- Strategy, scope → `/plan-ceo-review`
- Architecture → `/plan-eng-review`
- Design system, plan review → `/design-consultation` or `/plan-design-review`
- Full review pipeline → `/autoplan`
- Bugs, errors → `/investigate`
- QA, testing site behaviour → `/qa` or `/qa-only`
- Code review, diff check → `/review`
- Visual polish → `/design-review`
- Ship, deploy, PR → `/ship` or `/land-and-deploy`
- Save progress → `/context-save`
- Resume context → `/context-restore`

## Browser skills and the hero

`/qa`, `/design-review` and `/browse` drive a **headless** Chromium, which on
this machine reports `webgl2: false`. For the hero that silently resolves
`useLaserTier()` to `"off"`, so the WebGL rig never mounts and the screenshots
show the static CSS fallback instead. They look plausible, which is the trap.

Any finding those skills produce about the hero's beams, spotlights or strobe is
invalid until re-checked in a GPU-backed browser (`browse connect`). The rest of
the page is fine to QA headlessly.

See `docs/verifying-visuals.md` for the confirmation checks and the frame
sampling rules.
