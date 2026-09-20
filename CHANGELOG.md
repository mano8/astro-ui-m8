# Changelog

All notable changes to `@mano8/astro-ui-m8` are documented here.

This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
This package registers no routes and fronts no backend service, so its major
version tracks its own registry surface (breaking prop/export/markup changes
to a shipped block or recipe), not any service-version line.

Backfilled retroactively on 2026-09-20 (`B9-changelog-parity`): this file did
not exist through the first twelve published releases. Entries below are
reconstructed from `git log`/`git tag` history rather than written at release
time; content is accurate to the commits each tag contains, but wording may
differ from how the change would have been described on the day it shipped.

## [Unreleased]

## [1.5.1] - 2026-08-30

### Changed

- Shared dev tooling (lint/test/build toolchain deps) aligned to latest and
  the package bumped `1.5.0` → `1.5.1`. No registry, block or recipe surface
  changes.

## [1.5.0] - 2026-08-25

### Added

- **Generic controlled tree-view block**, with the ARIA tree keyboard contract
  (arrow-key navigation, expansion, selection) and a documented hook/a11y
  contract. Added to `registry.json` and the build output, and documented in
  `registry/README.md` and the frozen-name list.
- **Command-palette block** (`A-C4`) and **error-boundary block** (`A-C3`)
  added to the canonical registry.
- **Axe accessibility baseline** and a typed label-map contract added to the
  kit (`A-C5`).
- **Skin/logic version-lock guard** (`A-C6`), so a registry skin can assert
  the runtime block version it was written against.

### Fixed

- The dev preview gallery resolves copied-sibling imports correctly and is
  gated out of CI-consumer builds.
- The npm CLI resolution in the tarball smoke test now works on POSIX CI
  runners, not only locally.

### Changed

- Fleet alignment gates (registry-drift, colour-literal, no-cross-plugin-import)
  now run in CI instead of by hand, and the drift gate refuses an untracked
  path (`C12`).
- Deprecated `baseUrl` dropped from fixture `tsconfig`s.
- `package-lock.json` synced with the skin-lock bin and the `jest-axe` peer.
- Tarball packaging tests now require the tree-view, command-palette and
  error-boundary blocks to be present in the published package.

## [1.4.2] - 2026-08-16

### Changed

- `undici` (dev dependency) bumped `7.28.0` → `7.29.0` via Dependabot.

## [1.4.1] - 2026-08-02

### Fixed

- Registry source-inlining normalizes CRLF to LF, so a block authored or
  edited on Windows no longer ships mixed line endings in its inlined source.

### Changed

- `lucide-react` dependency refined and `zod` dependency updated as part of
  the same release.

## [1.4.0] - 2026-07-29

### Changed

- Migrated lint tooling to the ESLint 9 flat-config format.
- Registry state-synchronization effects reworked to avoid redundant renders.
- Resolved a Codacy toolbar-complexity finding in a registry component.

## [1.3.2] - 2026-07-29

### Changed

- Documentation restructured for agent use, with `CLAUDE.md` agent
  instructions added.
- `.gitignore` reorganized for readability; `REPOSITORY_CONTEXT.md` excluded
  from Codacy checks.
- CI quality tooling and release metadata aligned.

## [1.3.1] - 2026-07-16

### Added

- Codacy quality gates and lcov coverage report generation.

### Changed

- Linting rules aligned with Codacy's configuration.

## [1.3.0] - 2026-07-13

### Added

- Theme detection and handling for `ToastNotificationHost`, so a toast
  respects the host page's light/dark theme rather than a fixed palette.

### Changed

- `data-table` layout switched to flexbox for improved internal spacing.

## [1.2.0] - 2026-07-13

### Added

- `position` prop on `ToastNotificationHost`, so a host can place toast
  notifications at any of the standard screen corners/edges instead of one
  fixed position.

### Fixed

- Vertical spacing between the `data-table` toolbar, pagination and table
  itself.

## [1.1.0] - 2026-07-13

### Added

- Row-selection support in the `data-table` registry block.
- Canonical toast-notification host (`ToastNotificationHost`).

### Changed

- README updated with the CI/CD badge.

## [1.0.0] - 2026-07-12

First stable release.

### Added

- Canonical `data-table` registry block and its parts.
- Shared state recipes (loading/empty/error/unauthorized) and the
  `dialog-form` / `table-page` recipes.
- Shared helpers and the plugin fleet's test harness.
- Registry naming and host-contract documentation, plus the registry
  consumer/tarball-install verification fixtures.
- Dev preview fixture for the registry.

## [0.1.0-alpha.1] - 2026-07-05

Initial pre-release, published to npm ahead of the `v1.0.0` git tag (no `git
tag` exists for this version — its date is npm's own publish timestamp).
Scaffold for the canonical shared UI package: the initial registry shape
that `1.0.0` built on.
