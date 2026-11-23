# @hybrid-compute/core

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-green.svg)](http://makeapullrequest.com)
[![SemVer 2.0](https://img.shields.io/badge/SemVer-2.0-green.svg)](http://semver.org/spec/v2.0.0.html)
![npm version](https://img.shields.io/npm/v/@hybrid-compute/core)
![issues](https://img.shields.io/github/issues/phun-ky/hybrid-compute)
![license](https://img.shields.io/npm/l/@hybrid-compute/core)
![size](https://img.shields.io/bundlephobia/min/@hybrid-compute/core)
![npm](https://img.shields.io/npm/dm/%40hybrid-compute/core)
![GitHub Repo stars](https://img.shields.io/github/stars/phun-ky/hybrid-compute)
[![codecov](https://codecov.io/gh/phun-ky/hybrid-compute/graph/badge.svg?token=VA91DL7ZLZ)](https://codecov.io/gh/phun-ky/hybrid-compute)
[![build](https://github.com/phun-ky/hybrid-compute/actions/workflows/check.yml/badge.svg)](https://github.com/phun-ky/hybrid-compute/actions/workflows/check.yml)

Part of the [`@hybrid-compute`](https://github.com/phun-ky/hybrid-compute)
monorepo.

> See the [main README](https://github.com/phun-ky/hybrid-compute#readme) for
> full project overview, usage examples, architecture, and contribution
> guidelines.

## API Docs

[HybridCompute Core API Documentation](https://phun-ky.net/hybrid-compute/api/@hybrid-compute/core/classes/HybridCompute)

## 📦 Package Info

This package provides:

- The core orchestrator `HybridCompute` class
- Strategy-based task routing (`local`, `worker`, `remote`, or `auto`)
- Unified API for compute execution

## Usage

```bash
npm install @hybrid-compute/core @hybrid-compute/local
```

`HybridCompute` runs each task on a backend: `@hybrid-compute/local` on the
calling thread, `@hybrid-compute/worker` in a Web Worker, or
`@hybrid-compute/remote` over HTTP or WebSocket. With the local backend:

```ts
import { createLocalCompute } from '@hybrid-compute/local';

import { createHybridCompute } from '@hybrid-compute/core';

const local = createLocalCompute();

local.registerTask({
  name: 'echo',
  run: async (input: string) => `Echo: ${input}`
});

const compute = createHybridCompute({ local });

console.log(await compute.runTask('echo', 'Hello from HybridCompute!')); // Echo: Hello from HybridCompute!
```

Each backend has a guide on the
[documentation site](https://phun-ky.net/hybrid-compute/):
[local](https://phun-ky.net/hybrid-compute/guide/usage/local),
[worker](https://phun-ky.net/hybrid-compute/guide/usage/worker) and
[remote](https://phun-ky.net/hybrid-compute/guide/usage/remote), with example
servers for the remote transports. The
[main README](https://github.com/phun-ky/hybrid-compute#usage) has the same
examples in one place.

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
