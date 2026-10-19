# Security Policy

`@hybrid-compute/core` has one runtime dependency,
[`@phun-ky/typeof`](https://github.com/phun-ky/typeof) (MIT). `local`, `remote`
and `worker` depend only on `core`. How dependencies are chosen, tracked and
kept clear of known vulnerabilities is described under
[Dependencies](#dependencies).

## Supported Versions

The packages are below 1.0, so their API can still change in a minor release.
Until 1.0:

| Release                                | Supported |
| -------------------------------------- | --------- |
| Latest release of each package (`0.x`) | ✅        |
| Older `0.x` releases                   | ❌        |

To get a fix, upgrade to the newest release. Read the changelog first: below
1.0, a minor release may contain breaking changes.

From 1.0, support follows the major version:

- **The current major is supported as a whole.** Fixes are released as a new
  patch or minor of it, and upgrading within a major never breaks your code.
  That includes deprecated APIs, as long as the major ships them.
- **The previous major gets fixes for high and critical vulnerabilities for 6
  months** after the next major is released, as a patch on its latest release.
  `0.x` gets no more releases once 1.0 is out.
- **Security comes before the deprecation grace period.** If a vulnerability
  can't be fixed without breaking an API, the fix may change or remove it in a
  patch or minor release instead of waiting for a major. The change is kept as
  small as possible, and the advisory and the release notes say what changed and
  why.

Every package is covered: `@hybrid-compute/core`, `local`, `remote` and
`worker`.

## Reporting a Vulnerability

Report vulnerabilities privately, either with GitHub's
[private vulnerability reporting](https://github.com/phun-ky/hybrid-compute/security/advisories/new)
or by email to <security@phun-ky.net>. Please don't open a public issue for a
security problem.

## How Reports Are Handled

1. **Acknowledgement:** you'll get a reply within 7 days confirming the report
   was received.
2. **Assessment:** the maintainer reproduces the issue and judges its severity,
   and may ask you for details.
3. **Fix:** a fix is developed in a private GitHub security advisory and
   released as a new version of each affected package. The aim is a fix within
   30 days for serious issues.
4. **Disclosure:** the advisory is published when the fix is released, with a
   CVE where one applies. Please keep the issue private until then.
5. **Credit:** reporters are credited in the advisory and the release notes,
   unless they ask to stay anonymous.

## Security Expectations

`hybrid-compute` decides **where** a task runs. It does not sandbox tasks or
check what they do.

What you can rely on:

- **No data collection.** The packages send nothing anywhere on their own. The
  only network traffic is what `remote` sends to the endpoint you configure.
- **Tasks run only where you put them.** `local` runs the functions you register
  in the same thread, `worker` posts messages to the worker script you name, and
  `remote` talks only to the endpoint you pass in.
- **No dynamic code.** No `eval`, `new Function` or loading of code from task
  input.
- **Releases are traceable.** Every package is built and published from GitHub
  Actions, with signed provenance (see below).

What you can't rely on:

- **Isolation between tasks.** Local tasks run with the full rights of your
  application. A Web Worker has its own thread, not its own security context.
- **Trust in remote results.** Results and errors from a remote endpoint or a
  worker are returned as they are, without validation. Treat them as input.
- **Keeping data on the device.** With the `auto` strategy, a task that no
  worker or local backend can run goes to `remote`, and a `remote` backend
  created without `canRunTasks` accepts every task. The task name and input are
  then sent to the endpoint as JSON. Set `canRunTasks`, or pick a strategy, when
  input must not leave the device.
- **Transport security and authentication.** `remote` adds neither. Use `https:`
  and `wss:` endpoints, and authenticate on the server side.
- **Availability.** There are no timeouts or rate limits; a remote endpoint that
  never answers leaves the task pending.

## Verifying Releases

Every package is published from GitHub Actions with npm trusted publishing, and
carries a signed provenance attestation (Sigstore) that links it to the commit
and workflow run that built it. To verify the packages you've installed:

```shell
npm audit signatures
```

The provenance must name the repository `phun-ky/hybrid-compute` and the
workflow `.github/workflows/publish.yml`. Each package's page on npm shows this
under "Provenance", and
`npm view @hybrid-compute/<package>@<version> dist.attestations` lists the
attestations.

Each GitHub release also has a software bill of materials attached, in CycloneDX
format (`<package>-<version>.cdx.json`), listing the package's runtime
dependencies.

## Dependencies

**Choosing them.** The fewer runtime dependencies, the better. A new one is
discussed in an issue first, and must be widely used, actively maintained and
under an OSI-approved licence compatible with MIT; strong copyleft licences
(GPL, AGPL) are not accepted for runtime dependencies. Development dependencies
follow the same rules, judged more loosely.

**Obtaining them.** Packages come only from the npm registry, with exact
versions locked in `package-lock.json` and installed with `npm ci` in CI. GitHub
Actions are pinned to commit SHAs.

**Tracking them.** Dependabot proposes version updates weekly and security
updates as soon as an advisory is published. Every pull request runs
[dependency review](https://github.com/phun-ky/hybrid-compute/blob/main/.github/workflows/dependency-review.yml),
and every release runs `npm audit` on runtime dependencies first.

**Fixing known vulnerabilities.** Findings are checked against the GitHub
Advisory Database:

| Finding                    | Where                  | What happens                                                                                     |
| -------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------ |
| Critical or high           | Runtime dependency     | Blocks merging (dependency review) and releasing (`npm audit`); fixed and released within 7 days |
| Critical or high           | Development dependency | Blocks merging when introduced; an existing one is fixed within 30 days                          |
| Moderate or low            | Any dependency         | Fixed with the next update, within 90 days                                                       |
| Licence outside the policy | New dependency         | Not merged                                                                                       |

**Accepted exceptions.** A vulnerability that can't be fixed yet and can't be
exploited through this project is allowed in dependency review, and its alert is
dismissed with the reason. Each one is listed here and removed as soon as a fix
is reachable:

| Advisory                                                                 | Package            | Why it is accepted                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------ | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [GHSA-c475-qrg2-pj4r](https://github.com/advisories/GHSA-c475-qrg2-pj4r) | `basic-ftp` (high) | Development only, through `release-it` > `proxy-agent` > `get-uri`. The vulnerable code parses FTP directory listings, which is only reached when a proxy auto-config file is fetched over `ftp://`; releases never do that. `get-uri` requires `basic-ftp` 5, and the fix is in 6.2.1. |

## Code Scanning

CodeQL analyses every pull request and every push to `main`. The ruleset on
`main` blocks merging while CodeQL reports an error, or a security alert of high
or critical severity. OpenSSF Scorecard runs on every push to `main`.

## Secrets

The project keeps as few secrets as possible:

| Secret          | Used by       | For                                                   |
| --------------- | ------------- | ----------------------------------------------------- |
| `GH_TOKEN`      | `publish.yml` | Pushing release commits and tags, and GitHub releases |
| `CODECOV_TOKEN` | `check.yml`   | Uploading coverage reports                            |

Publishing to npm needs no secret: it uses short-lived OIDC tokens from GitHub.

- **Storage:** secrets are kept only as encrypted GitHub Actions secrets, never
  in the repository. Secret scanning with push protection blocks commits that
  contain one.
- **Access:** only the maintainer can view or change them, and they are not
  available to workflows run from forks.
- **Rotation:** at least once a year, and immediately if one may have been
  exposed.
