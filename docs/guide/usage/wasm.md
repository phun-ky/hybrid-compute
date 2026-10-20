# WebAssembly

WebAssembly needs no backend of its own. A WebAssembly module's exports are
functions, so you register them as tasks:

- with `local`, they run on the main thread, which suits quick functions
- in a worker, with `exposeTasks`, they run on their own thread, which suits
  heavy work and keeps the page responsive

This guide builds a small Rust library with
[wasm-pack](https://github.com/rustwasm/wasm-pack) and uses it both ways.

[[toc]]

## What you need

- [Rust](https://www.rust-lang.org/tools/install), with the WebAssembly target:

  ```sh
  rustup target add wasm32-unknown-unknown
  ```

- wasm-pack, which builds the module and writes its JavaScript glue:

  ```sh
  cargo install wasm-pack
  ```

## Write the Rust library

```sh
cargo new --lib primes
```

In `primes/Cargo.toml`, build a `cdylib` (the kind of library WebAssembly needs)
and add `wasm-bindgen`, which passes strings and numbers between JavaScript and
Rust:

```toml
[package]
name = "primes"
version = "0.1.0"
edition = "2024"

[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"

[profile.release]
opt-level = "s"
```

`primes/src/lib.rs` has two functions: `countPrimes`, which is heavy work, and
`slugify`, which is quick:

```rust
use wasm_bindgen::prelude::*;

/// How many primes there are up to and including `limit`.
#[wasm_bindgen(js_name = countPrimes)]
pub fn count_primes(limit: u32) -> u32 {
    if limit < 2 {
        return 0;
    }

    let limit = limit as usize;
    let mut composite = vec![false; limit + 1];
    let mut count = 0;

    for n in 2..=limit {
        if composite[n] {
            continue;
        }

        count += 1;

        // n * n would overflow on wasm32, where usize is 32 bits, so compare
        // n with limit / n instead
        if n <= limit / n {
            for multiple in (n * n..=limit).step_by(n) {
                composite[multiple] = true;
            }
        }
    }

    count
}

/// A URL slug: lowercase ASCII letters and digits, separated by single dashes.
#[wasm_bindgen]
pub fn slugify(text: &str) -> String {
    text.to_lowercase()
        .split(|c: char| !c.is_ascii_alphanumeric())
        .filter(|word| !word.is_empty())
        .collect::<Vec<_>>()
        .join("-")
}
```

::: warning usize is 32 bits in WebAssembly

On `wasm32`, `usize` is 32 bits, so `n * n` overflows for `n` above 65535. A
release build wraps instead of panicking, and the sieve would quietly give wrong
counts. Comparing `n <= limit / n` avoids the overflow.

:::

## Build it

```sh
cd primes
wasm-pack build --target web --release
```

This writes `primes/pkg`: `primes_bg.wasm` (about 35 kB), `primes.js`, the glue
that loads it, and `primes.d.ts` with the types. Add it to your app as a
dependency:

```sh
npm install ./primes/pkg
```

The glue's default export, `init`, loads the `.wasm` file. Call it, and wait for
it, before calling `countPrimes` or `slugify`.

## On the main thread, with local

Quick functions can run where they're called:

```ts
import init, { slugify } from 'primes';

import { createLocalCompute } from '@hybrid-compute/local';

await init();

const local = createLocalCompute();

local.registerTask({ name: 'slugify', run: (text: string) => slugify(text) });

await local.runTask('slugify', 'Hello, WebAssembly World!'); // 'hello-webassembly-world'
```

## In a worker

Heavy work belongs on its own thread. The worker script loads the module and
answers tasks with `exposeTasks`. Call `exposeTasks` straight away, and let each
task wait for the module:

```ts
// primes.worker.ts
import init, { countPrimes } from 'primes';

import { exposeTasks } from '@hybrid-compute/worker';

// Start loading the module now, but listen for tasks straight away
const ready = init();

exposeTasks({
  countPrimes: async (limit: number) => {
    await ready;

    return countPrimes(limit);
  }
});
```

::: warning Don't await init() before exposeTasks

With `await init()` at the top of the worker script, a task sent while the
module loads is lost: it never gets a reply. Calling `exposeTasks` first, as
above, means every task is heard and waits for the module.

:::

On the main thread, create the worker with `createWorker`. Bundlers such as Vite
and webpack build the worker script, the glue and the `.wasm` file because they
see `new Worker(new URL(...))` written out in full:

```ts
import { createThreadedCompute } from '@hybrid-compute/worker';

const worker = createThreadedCompute({
  createWorker: () =>
    new Worker(new URL('./primes.worker.ts', import.meta.url), {
      type: 'module'
    }),
  canRunTasks: ['countPrimes']
});

await worker.runTask('countPrimes', 1_000_000); // 78498
```

## Together, with core

Give each backend the tasks it should run, and the `auto` strategy sends each
task to the right place:

```ts
import { createHybridCompute } from '@hybrid-compute/core';

const compute = createHybridCompute({ local, worker });

await compute.runTask('countPrimes', 1_000_000); // in the worker
await compute.runTask('slugify', 'Hello, World'); // on the main thread
```

Where there are no Web Workers, such as in server-side rendering, the worker
backend's `canRun` is `false`. Register `countPrimes` with `local` too, and
`auto` falls back to it there.

## Why the worker matters

`countPrimes(30_000_000)` takes about half a second either way. Measured in
Chrome, with a timer that ticks every 10 ms on the main thread while it runs:

| Where it runs | Time   | Timer ticks on the main thread |
| ------------- | ------ | ------------------------------ |
| `worker`      | 538 ms | 53                             |
| `local`       | 529 ms | 0                              |

With `local`, the page can't respond to anything until the task is done. In the
worker, it carries on as usual.

## In Node.js

`--target web` glue fetches the `.wasm` file, which Node.js can't do for a file
path. Load the bytes yourself and use `initSync`:

```ts
import { initSync, slugify } from 'primes';

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

initSync({ module: readFileSync(require.resolve('primes/primes_bg.wasm')) });
```

Then register the functions with `local`. The worker backend needs Web Workers,
so it runs in browsers, Deno and Bun; Node.js support is tracked in
[#127](https://github.com/phun-ky/hybrid-compute/issues/127).

## Other languages

Nothing here is specific to Rust. With any toolchain that compiles to an ES
module, such as [AssemblyScript](https://www.assemblyscript.org/) or
[Emscripten](https://emscripten.org/) with `-sEXPORT_ES6`, the pattern is the
same: load the module, then register its functions with `local` or expose them
from a worker. Only the loading step differs, so follow your toolchain's docs
for that part.
