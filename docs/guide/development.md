# Development

::: info

Want to contribute? Please read the
[CONTRIBUTING.md](https://github.com/phun-ky/hybrid-compute/blob/main/CONTRIBUTING.md)
and
[CODE_OF_CONDUCT.md](https://github.com/phun-ky/hybrid-compute/blob/main/CODE_OF_CONDUCT.md).

:::

## Install

To develop **Hybrid Compute**, fork it, and then in the project root:

```sh
npm i
```

## Build

```sh
npm run build
```

## Test the code

```sh
npm test
```

## Commit

To commit, we use
[semantic git commits with Commitizen](https://github.com/streamich/git-cz). So
please run this when you are ready to commit your staged files:

```sh
npm run commit
```

When you are done with your development, create a PR with the original
repository :)

## Releases

Releases run automatically when a pull request is merged. Each package is
versioned on its own, and only packages with something to release get a new
version. What counts is the conventional commits that touch what a package
publishes (its source without tests, `package.json`, `README.md` and `LICENSE`)
since its last release:

| Commit                                             | Release                       |
| -------------------------------------------------- | ----------------------------- |
| Breaking change (`feat!:` or `BREAKING CHANGE:`)   | Major (minor while below 1.0) |
| `feat`                                             | Minor                         |
| `fix`, `perf`, `revert`                            | Patch                         |
| `chore`, `docs`, `ci`, `test`, `style`, `refactor` | None                          |

A package that depends on a sibling gets a patch when the sibling's new version
falls outside its `^` range. To see what the next release would be:

```sh
npm run release:dry-run
```

Before publishing anything, the release builds the packages and runs the same
check as CI: each package is packed as npm would publish it (only `dist` and
`CHANGELOG.md`, listed in `files`), installed into an empty project and
imported. Run it yourself after a build:

```sh
npm run build && npm run check:pack
```

## Clean code

[ESLint](https://eslint.org/), [Prettier](https://prettier.io/) and
[Putout](https://github.com/coderaiser/putout) is used
