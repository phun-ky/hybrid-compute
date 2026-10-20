# Assurance Case

This document argues why Hybrid Compute meets the security expectations in the
[security policy](SECURITY.md#security-expectations), and says where it doesn't
yet. It covers the threat model, the trust boundaries, how secure design
principles are applied, and how common weaknesses are countered. It's reviewed
whenever a change affects security, such as a new transport or backend.

## What is being protected

- **The integrity of the published packages:** what users install from npm must
  be exactly what was built from this repository.
- **The applications that use them:** dispatching a task must not give anyone
  else a way to run code in the application, or to receive data the application
  didn't choose to send.
- **The user's data:** task input goes only where the application configured it
  to go.

There are no secrets, accounts or personal data in the software itself.

## Threat model

| Threat                                                                    | Where it would come from             |
| ------------------------------------------------------------------------- | ------------------------------------ |
| Malicious code merged into the repository                                 | A pull request                       |
| A compromised dependency or CI action                                     | The npm registry, GitHub Actions     |
| A tampered package on npm                                                 | The release pipeline, a stolen token |
| A malicious or malformed result from a remote endpoint or a worker script | The remote service, the worker file  |
| Task input sent somewhere the application didn't intend                   | Misconfiguration of `auto`/`remote`  |
| A remote endpoint that never answers                                      | The network, the remote service      |

## Trust boundaries

```text
 contributor ──pull request──▶ repository ──GitHub Actions──▶ npm ──install──▶ application
                  (review, CI)              (trusted publishing,        (npm audit
                                             provenance)                 signatures)

 application ──runTask──▶ core ──▶ local   (same thread, trusted code)
                               ├─▶ worker  (postMessage to the worker script)
                               └─▶ remote  (fetch or WebSocket to the endpoint)
```

1. **Contributor to repository.** Every change arrives as a pull request. The
   ruleset on `main` requires the Checks workflow (build, lint, type-check, docs
   check and tests), the DCO sign-off, dependency review and CodeQL results with
   no errors and no high or critical security alerts before a merge.
2. **Repository to npm.** Releases are built and published by GitHub Actions
   with npm trusted publishing (OIDC). There is no long-lived npm token to
   steal, every package gets a signed provenance attestation, and `npm audit`
   blocks a release with a known high or critical runtime vulnerability.
3. **npm to application.** Users can check that what they installed was built
   from this repository with `npm audit signatures`.
4. **Application to backends.** The application chooses the backends, the worker
   script and the remote endpoint. Tasks registered with `local` are the
   application's own code. Results from a worker or a remote endpoint cross a
   boundary and are returned to the caller as they are.

## Secure design principles

- **Economy of mechanism.** Each package is a few hundred lines with no runtime
  dependencies outside the monorepo, which keeps them simple to review.
- **Fail-safe defaults.** When no configured backend matches the strategy,
  `runTask` rejects with an error, and an unknown local task throws. A worker
  that crashes or never loads rejects every task waiting for it.
- **Least privilege.** The packages request no permissions of their own. GitHub
  Actions workflows are read-only by default, and jobs are granted only what
  they need, such as `id-token: write` for publishing.
- **Open design.** Everything, including the release pipeline, is public; no
  security depends on secrecy.
- **No dynamic code.** No `eval`, `new Function` or loading of code from task
  input; tasks are looked up by name in a `Map`, so names like `__proto__` can't
  reach object prototypes.

## Common weaknesses countered

| Weakness                                      | How it's countered                                                                                                                                   |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code injection (CWE-94)                       | No `eval` or `new Function`; task names select registered tasks, they are never executed                                                             |
| Prototype pollution (CWE-1321)                | Tasks are stored in a `Map` and a `Set`, not plain objects                                                                                           |
| Use of a vulnerable component (CWE-1395)      | Dependabot, dependency review on every pull request, `npm audit` before every release                                                                |
| Insecure CI configuration                     | Actions pinned to commit SHAs, read-only default permissions, no untrusted input interpolated into scripts                                           |
| Missing integrity check on download (CWE-494) | npm provenance attestations, verifiable with `npm audit signatures`                                                                                  |
| Uncontrolled resource consumption (CWE-400)   | Remote tasks time out (30 seconds by default) and can be cancelled; WebSocket connections and workers start only when needed and stop with `close()` |

## Known gaps

These are tracked and are honest limits today, not hidden risks:

- **Results are trusted.** `remote` and `worker` check a reply's shape and
  ignore messages they can't match, but don't validate the result itself. Treat
  results as input; see the security policy.
- **Worker tasks have no timeout by default,** since workers are for long
  running work. A task the worker script never answers stays pending unless a
  `timeout` is set or it's cancelled with an `AbortSignal`. Remote tasks time
  out after 30 seconds by default.
- **One maintainer.** Changes are not reviewed by a second person; see
  [governance](GOVERNANCE.md#continuity).
