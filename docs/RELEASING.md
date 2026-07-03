# Releasing PlanQueue

Mechanical release process for maintainers. PlanQueue ships two packages that
must be published in order: the core (`@aryrabelo/planqueue-core`) first, then
the plugin (`@aryrabelo/planqueue`), which depends on it.

## 1. Bump the version

Bump `version` in `package.json` for the package(s) you are releasing. The
plugin's dependency on the core must be a published semver range
(`"@aryrabelo/planqueue-core": "^0.1.0"`), never a `file:` path — a `file:`
specifier breaks every consumer install. If you bumped the core, bump the
plugin's dependency floor to match.

## 2. Update the CHANGELOG

Add a `## X.Y.Z` entry (Keep a Changelog format) in the CHANGELOG of each
package being released. Move items out of `Unreleased` into the new version.

## 3. Run the gates

Both repos must be green before publishing:

```bash
bun install --frozen-lockfile
bun run lint
bun run typecheck
bun test
```

## 4. Publish to npm (dependency order matters)

Publish the core first so the plugin can resolve it from the registry.

```bash
# core first
cd ~/Sites/planqueue-core && npm publish --access public
npm view @aryrabelo/planqueue-core version   # confirm it is live

# then the plugin
cd ~/Sites/omp-plan-queue && npm publish --access public
```

Both packages set `publishConfig.access: "public"`. Verify each tarball with
`npm pack --dry-run` before publishing — it must exclude tests, `src/AGENTS.md`,
`.claude/`, and any local state.

## 5. Tag and cut the GitHub release

```bash
git tag -a vX.Y.Z -m "PlanQueue vX.Y.Z"
git push origin vX.Y.Z
gh release create vX.Y.Z --title "PlanQueue vX.Y.Z" --generate-notes
```
