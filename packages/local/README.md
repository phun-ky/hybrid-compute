# @hybrid-compute/local

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-green.svg)](http://makeapullrequest.com)
[![SemVer 2.0](https://img.shields.io/badge/SemVer-2.0-green.svg)](http://semver.org/spec/v2.0.0.html)
![npm version](https://img.shields.io/npm/v/@hybrid-compute/local)
![issues](https://img.shields.io/github/issues/phun-ky/hybrid-compute)
![license](https://img.shields.io/npm/l/@hybrid-compute/local)
![size](https://img.shields.io/bundlephobia/min/@hybrid-compute/local)
![npm](https://img.shields.io/npm/dm/%40hybrid-compute/local)
![GitHub Repo stars](https://img.shields.io/github/stars/phun-ky/hybrid-compute)
[![codecov](https://codecov.io/gh/phun-ky/hybrid-compute/graph/badge.svg?token=VA91DL7ZLZ)](https://codecov.io/gh/phun-ky/hybrid-compute)
[![build](https://github.com/phun-ky/hybrid-compute/actions/workflows/check.yml/badge.svg)](https://github.com/phun-ky/hybrid-compute/actions/workflows/check.yml)

Part of the [`@hybrid-compute`](https://github.com/phun-ky/hybrid-compute)
monorepo.

> See the [main README](https://github.com/phun-ky/hybrid-compute#readme) for
> full project overview, usage examples, architecture, and contribution
> guidelines.

## API Docs

[LocalCompute API Documentation](https://phun-ky.net/hybrid-compute/api/@hybrid-compute/local/classes/LocalCompute)

## 📦 Package Info

This package provides:

- A compute backend that runs tasks on the calling thread
- In-memory task registration by unique name, with `unregisterTask` to remove
  one
- Ideal for small, cheap tasks; heavy work belongs in the worker backend

## Usage

```bash
npm install @hybrid-compute/local
```

```ts
import { createLocalCompute } from '@hybrid-compute/local';
```

To run a WebAssembly module's functions on the main thread, register them as
tasks; the
[WebAssembly guide](https://phun-ky.net/hybrid-compute/guide/usage/wasm) shows
how.

---

## Contributing

Want to contribute? Please read the
[CONTRIBUTING.md](https://github.com/phun-ky/hybrid-compute/blob/main/CONTRIBUTING.md)
and
[CODE_OF_CONDUCT.md](https://github.com/phun-ky/hybrid-compute/blob/main/CODE_OF_CONDUCT.md)

## License

This project is licensed under the MIT License - see the
[LICENSE](https://github.com/phun-ky/hybrid-compute/blob/main/LICENSE) file for
details.

## Sponsor me

I'm an Open Source evangelist, creating stuff that does not exist yet to help
get rid of secondary activities and to enhance systems already in place, be it
documentation, tools or web sites.

The sponsorship is an unique opportunity to alleviate more hours for me to
maintain my projects, create new ones and contribute to the large community
we're all part of :)

[Support me on GitHub Sponsors](https://github.com/sponsors/phun-ky).
