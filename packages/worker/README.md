# @hybrid-compute/worker

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

[ThreadedCompute API Documentation](https://github.com/phun-ky/hybrid-compute/blob/main/docs/api/worker/src/classes/ThreadedCompute.md)

## 📦 Package Info

This package provides:

- A compute backend that runs tasks in a dedicated Web Worker
- Asynchronous task messaging via `postMessage`
- Useful for offloading CPU-intensive work from the main thread

## Usage

```bash
npm install @hybrid-compute/worker
```

```ts
import { createThreadedCompute } from '@hybrid-compute/worker';

const threaded = createThreadedCompute(
  new URL('./worker.js', import.meta.url),
  ['add']
);
```
