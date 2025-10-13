# @hybrid-compute/wasm

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

## 📦 Package Info

This package provides:

- A compute backend that runs tasks in a dedicated Web wasm
- Asynchronous task messaging via `postMessage`
- Useful for offloading CPU-intensive work from the main thread

## Examples

### Numeric (WAT) - multiply

```bash
npm install @hybrid-compute/wasm
```

**Create `mul.wat`**

```wat
(module
  (func $mul (export "mul") (param $a i32) (param $b i32) (result i32)
    local.get $a
    local.get $b
    i32.mul)
)
```

**Compile to WASM:**

```bash
wat2wasm mul.wat -o mul.wasm
```

**Using it in consumer code**

```ts
import { createHybridCompute } from '@hybrid-compute/core';
import { WasmCompute, registerNumericExportTask } from '@hybrid-compute/wasm';

const wasm = new WasmCompute({
  source: new URL('./mul.wasm', import.meta.url)
});
await wasm.init();

registerNumericExportTask(wasm, 'mul', 'mul');

const hc = createHybridCompute({
  local: undefined,
  worker: undefined,
  remote: undefined
});
/** You can also route via the wasm backend directly if you decide to expose it under 'local' slot,
 *  or extend HybridComputeOptionsInterface to add a wasm field. For now, call wasm directly: */
const result = await wasm.runTask<number[], number>('mul', [6, 7]);
console.log(result); // 42
```

### Strings - echo (with memory helpers)

We assume these exports:

- `memory: WebAssembly.Memory`
- `alloc(len: i32): i32`
- `echo(ptr: i32, len: i32): i32` (returns pointer to null-terminated UTF-8
  string)

```ts
import { WasmCompute } from '@hybrid-compute/wasm';
import {
  writeStringToMemory,
  readStringFromMemory
} from '@hybrid-compute/wasm';

const wasm = new WasmCompute({
  source: new URL('./echo.wasm', import.meta.url)
});
await wasm.init();

const { memory, alloc, echo } = wasm.exports as unknown as {
  memory: WebAssembly.Memory;
  alloc: (bytes: number) => number;
  echo: (ptr: number, len: number) => number;
};

wasm.registerTask<string, string>({
  name: 'echoStr',
  async run(input: string) {
    const ptr = writeStringToMemory(input, memory, alloc);
    const outPtr = echo(ptr, input.length);
    return readStringFromMemory(outPtr, memory);
  }
});

const out = await wasm.runTask('echoStr', 'hello wasm');
console.log(out); // "hello wasm"
```

> If your WASM build returns length separately (ptr/len), adapt readString… to
> take (ptr,len) flavour, or ensure your export writes a null terminator.

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

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people
are hurt, without shelter and need help**. You can help in various ways, for
instance, directly helping refugees, spreading awareness, putting pressure on
your local government or companies. You can also support Ukraine by donating
e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine),
[Ukraine humanitarian organisation](https://savelife.in.ua/en/donate-en/#donate-army-card-weekly)
or
[donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
