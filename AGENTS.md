# Serenity UI development

- Use English for all repository content: comments, documentation, phase records, interface copy, diagnostic messages and Git commit messages.
- Keep documentation focused on production code, API usage and engineering decisions. Do not add learning paths or exercises.
- Write maintainable, idiomatic TypeScript and React: explicit public contracts, semantic HTML, focused responsibilities and abstractions justified by actual reuse. Do not simplify engineering standards for a beginner audience.
- Keep code consistently formatted. Document public component behavior with concise JSDoc and explain non-obvious decisions, accessibility constraints and integration boundaries inline. Avoid comments that merely repeat the code, and update comments when behavior changes.
- Figma is the approved design reference. Preserve the user's changes; inspect relevant nodes before implementing new families.
- Use existing semantic tokens. Regenerate `tokens/serenity-theme.css` with `npm run tokens`; never hand-edit it.
- Use 4 px metric multiples, 8 px action gaps, right-aligned card footers, native semantics and growing text. Typography/borders/effects keep their own scales.
- Solar Bold for controls; Solar Bold Duotone for inactive navigation and Bold for active navigation. Checkbox uses Unread, never Check Read.
- Keep tokens framework independent. React is the first adapter. Do not mark unimplemented components as available.
- Respect reduced motion, focus visibility, accessible names and native form behavior.
- Apply the shared interaction policy in `src/motion.css`: token-based color transitions and transform/opacity motion, immediate semantic state and focus, no `transition: all` or layout animation. New interactive components must include reduced-motion behavior and relevant browser verification. Charts are an explicit exception: animate decorative numeric marks from zero inside fixed plot bounds, while keeping semantic data and axes final. See `docs/COMPONENTS.md` and `docs/MOTION.md` for the motion contract.
- Run `npm run check` and relevant browser tests after functional changes. In Windows PowerShell use `npm.cmd` if `npm.ps1` is blocked.
- The complete kit is open source under MIT. Preserve third-party notices. Registry publishing and releases require an explicit request. Website-only implementation lives in the separate private sui-website repository.
- Maintain `docs/phases/README.md` as the phase index. Record delivered scope, decisions, actual checks, limitations and dated follow-up changes in the relevant phase file. Keep `docs/STATUS.md` as the current inventory; link to evidence rather than duplicating history. Planned work is not completed work, and a phase is not automatically a package release.
- The owner authorizes commits and pushes for completed, requested work. Review the diff, run appropriate checks, update the phase record and commit only the intended files with a descriptive English message. Push to the existing tracked branch after checking remote status. Preserve unrelated changes; never force-push or rewrite shared history without explicit authorization. Do not publish packages or create releases as part of a routine push.
