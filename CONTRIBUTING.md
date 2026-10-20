# Contributing to Hybrid Compute

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the
[Table of Contents](#table-of-contents) for different ways to help and details
about how this project handles them. Please read the relevant section before
making your contribution. It makes it a lot easier for the maintainer and
smooths out the experience for everyone involved.

> And if you like the project, but don't have time to contribute, that's fine.
> There are other easy ways to support the project and show your appreciation:
>
> - Star the project
> - Mention it in your project's readme
> - Tell your friends and colleagues about it

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Contributing Code](#contributing-code)
    - [Coding Style](#coding-style)
    - [Tests](#tests)
    - [Developer Certificate of Origin](#developer-certificate-of-origin)
    - [Commits and Pull Requests](#commits-and-pull-requests)
- [Attribution](#attribution)

## Code of Conduct

This project and everyone participating in it is governed by the
[Hybrid Compute Code of Conduct](https://github.com/phun-ky/hybrid-compute/blob/main/CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code. Please report
unacceptable behaviour to <code-of-conduct@phun-ky.net>.

## I Have a Question

> If you want to ask a question, we assume that you have read the available
> [documentation](https://phun-ky.net/hybrid-compute/).

Before you ask a question, search the existing
[issues](https://github.com/phun-ky/hybrid-compute/issues) that might help you.
If you find a suitable issue and still need clarification, write your question
in that issue.

If you still need to ask a question:

- Open an [issue](https://github.com/phun-ky/hybrid-compute/issues/new).
- Provide as much context as you can about what you're running into.
- Provide the versions of the packages, Node.js and npm, and the browser if the
  question is about the worker backend.

## I Want To Contribute

> ### Legal Notice
>
> When contributing to this project, you must agree that you have authored 100%
> of the content, that you have the necessary rights to the content and that the
> content you contribute may be provided under the project licence. You confirm
> this on every commit by signing it off under the
> [Developer Certificate of Origin](#developer-certificate-of-origin).

### Reporting Bugs

#### Before Submitting a Bug Report

A good bug report shouldn't leave others needing to chase you up for more
information. Please:

- Make sure that you are using the latest version.
- Check that it's really a bug and not an error on your side, for example an
  unsupported environment. Read the
  [documentation](https://phun-ky.net/hybrid-compute/) first.
- Search the
  [bug tracker](https://github.com/phun-ky/hybrid-compute/issues?q=label%3A%22problems%3A+%F0%9F%90%9B+bug%22)
  to see if the bug has already been reported.
- Collect information about the bug:
  - the error message and stack trace
  - the OS, Node.js, npm and browser versions, as relevant
  - the strategy and backends you configured, your input and the output
  - whether you can reproduce it reliably, and with older versions

#### How Do I Submit a Good Bug Report?

> Never report security issues, vulnerabilities or bugs that include sensitive
> information in the issue tracker or elsewhere in public. Report them privately
> as described in the [security policy](SECURITY.md#reporting-a-vulnerability).

Bugs are tracked as GitHub issues. If you run into a problem:

- Open an [issue](https://github.com/phun-ky/hybrid-compute/issues/new) with the
  bug report template.
- Explain the behaviour you expected and the actual behaviour.
- Describe the steps to reproduce it, ideally as a small piece of code that
  shows the problem on its own.
- Add the information you collected above.

Once it's filed, the maintainer labels it and tries to reproduce it. Without a
way to reproduce it, the issue is marked `pending: need repro` until there is
one. A reproduced bug is marked `🐛 needs fix`.

### Suggesting Enhancements

Enhancements, from new features to small improvements, are tracked as
[GitHub issues](https://github.com/phun-ky/hybrid-compute/issues).

Before suggesting one:

- Make sure that you are using the latest version, and read the
  [documentation](https://phun-ky.net/hybrid-compute/) to see if it's already
  possible.
- [Search](https://github.com/phun-ky/hybrid-compute/issues) for an existing
  suggestion, and add to it instead of opening a new one.
- Check that it fits the [roadmap](ROADMAP.md), including what is not planned.

A good suggestion has a clear title, describes the current behaviour and the
behaviour you'd like instead, and explains why it would be useful to most users.

### Contributing Code

Set up the project as described in the
[development guide](https://phun-ky.net/hybrid-compute/guide/development):
`npm install`, `npm run build`, then `npm test`. Larger changes are best
discussed in an issue first, so the work fits the [roadmap](ROADMAP.md).

#### Coding Style

Code follows the project's [ESLint](https://eslint.org/) configuration
(`eslint-config-phun-ky`), [Prettier](https://prettier.io/) formatting and
TypeScript in strict mode. A contribution must pass `npm run lint`,
`npm run format:check` and `npm run typecheck` with no errors. All of them run
in CI on every pull request, and a pull request that fails them can't be merged.

#### Tests

- **New functionality must come with tests** in the package's `__tests__`
  folder, run by `npm test`.
- **Bug fixes must come with a regression test** that fails without the fix.
- **Changes to the release scripts** come with tests in `scripts/__tests__`, run
  by `npm run test:scripts`.
- **Coverage must not drop.** `npm run test:ci` fails when a package's own
  source falls below 99% of lines, 100% of functions or 95% of branches, and CI
  uploads a coverage report for every pull request.
- **Property-based tests** with [fast-check](https://fast-check.dev/) live next
  to the other tests as `*.property.spec.ts`. Add one when a rule holds for
  every input, such as how a task is dispatched or that a message round-trips.

#### Developer Certificate of Origin

Every commit must be signed off under the
[Developer Certificate of Origin](https://developercertificate.org/) (DCO): a
statement that you wrote the change, or otherwise have the right to submit it
under the project's licence. You agree to it by adding a `Signed-off-by` line
with your name and email to the commit message:

```text
Signed-off-by: Your Name <you@example.com>
```

- **Per commit:** `git commit -s` adds the line for you.
- **Always:** `npm install` sets `core.hooksPath` to `.githooks`, and the hook
  in `.githooks/prepare-commit-msg` adds the line to every commit, including
  those made by `npm run commit` or your editor.
- **Forgot?** Sign off every commit on your branch and push again:
  `git rebase --signoff main` then `git push --force-with-lease`.

The DCO check on every pull request fails if a commit isn't signed off. Commits
by Dependabot are exempt.

#### Commits and Pull Requests

- Commits follow [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat:`, `fix:`, `docs:`, ...). `npm run commit` helps write them. Releases
  and changelogs are generated from them, as described in the
  [development guide](https://phun-ky.net/hybrid-compute/guide/development#releases),
  so pick the type that matches the change. A breaking change needs a
  `BREAKING CHANGE:` footer that says what to change.
- From 1.0 on, a breaking change also updates the migration guide in the same
  pull request, with before-and-after code, and adds to the release notes for
  the next major.
- From 1.0 on, deprecating an API isn't a breaking change, so it can land in any
  release. Mark it `@deprecated` with its replacement and the major it will be
  removed in. It keeps working through one full major: deprecated during 1.x or
  at 2.0, it can be removed in 3.0 at the earliest.
- Don't commit regenerated API docs (`docs/api`); each release regenerates them.
  Run `npm run docs:check` instead.
- Open a pull request against `main`. The Checks workflow builds, lints,
  type-checks, checks the API docs and runs the tests; all of it must pass.

## Attribution

This guide is based on
[contributing-gen](https://github.com/bttger/contributing-gen).
