# Changesets

Each feature/fix PR adds a changeset file (`npm run cs` at the repo root) describing
the change and the semver bump for the affected package. On release, `npm run cs:version`
consumes them to bump versions + changelogs. Actual publishing stays on the gated
`boost-ui Release` / `package Release` GitHub Actions workflows.
