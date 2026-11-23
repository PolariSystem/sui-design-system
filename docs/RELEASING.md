# Versioned delivery

Implementation phases describe work; package versions describe distributable changes. A documentation-only update does not automatically require a new package release. Keep all records, commit messages and release notes in English.

## Per phase

1. Add a numbered record under `docs/phases/` with objective, acceptance criteria and boundaries before implementation.
2. Inspect existing contracts, reproduce defects and implement focused changes. Preserve user work and the approved visual design.
3. Add tests for observable behavior, not copies of implementation details. Record actual results and unresolved limitations.
4. Update relevant API/installation guides and `docs/STATUS.md`. Keep planned work distinct from delivered work.
5. Review the complete diff, commit only intended files and push without rewriting shared history. Verify the remote commit matches the local commit.

## Release gate

For an explicitly requested release:

- Select the version deliberately. During 0.x development, use patch releases for compatible fixes and a minor release for a significant capability set or contract change; document any breaking changes explicitly.
- Update `package.json`, the root lockfile and the packed-consumer fixture's local archive reference together. Keep registry dependency resolutions locked.
- Add `docs/releases/<version>.md`, link it in `CHANGELOG.md` and the phase record, and include migration notes and known limitations.
- Run `npm run check`, `npm run check:package`, `npm run test:integration` and relevant browser regressions. GitHub Actions runs the complete workshop suite.
- Wait for all required jobs on the exact release commit. Do not tag a newer unchecked commit or claim a queued run passed.
- Publish the GitHub release as `v<version>` targeting that verified commit. Use the versioned release notes as its body and include the verification run link. Verify the tag, release target and remote branch afterward.

A GitHub release does not publish to npm. Registry publication is a separate, explicit maintainer action. Do not add registry credentials to the repository or embed them in frontend assets. A locally generated archive is available through `npm run pack:local`; ignored build and test output stays outside Git.

## Repeatable checks

GitHub Actions uses read-only permissions and separate integration/workshop verification jobs. The HTTP browser suite owns port 5176. For local workshop regressions while the website is running, set `SUI_TEST_PORT` to another free port, such as 5177. Use `SUI_BROWSER_CHANNEL=msedge` on Windows if relying on an installed Edge browser; CI uses Playwright Chromium.
