---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'Hybrid Compute'
  text: 'Run compute tasks wherever they run best'
  tagline: 'Local, threaded, or remote - with a pluggable backend architecture'
  image:
    src: './logo/logo.svg'
    alt: 'Hero Image Description'
  actions:
    - theme: brand
      text: Get started
      link: /guide/introduction/
    - theme: alt
      text: View on GitHub
      link: https://github.com/phun-ky/hybrid-compute

features:
  - title: Run compute where it runs best
    details:
      Dispatch tasks to the optimal environment - local JS, Web Worker, or a
      remote service - without changing your application code.

  - title: Auto strategy routing
    details:
      Use the <code class="ph language-">auto</code> strategy to prefer workers
      for CPU work, local for trivial logic, and remote when needed - based on
      <code class="ph language-">canRun()</code> capability checks.

  - title: Pluggable backends
    details:
      Swap or combine backends (local, worker, remote) via a clean interface;
      add custom backends without touching core.

  - title: Web Worker offloading
    details:
      Move heavy computations off the main thread to keep the UI smooth and
      responsive.

  - title: Remote execution over HTTP or WebSocket
    details:
      Call remote compute services with fetch or persistent WebSocket transport
      for low-latency streaming and batching.

  - title: Streaming-friendly design
    details:
      Built to accommodate token/NDJSON/chunked flows; ideal for LLM streaming
      and progressive rendering.
---

## Other features

- **Simple, uniform API:** Define tasks and call runTask(); the framework
  handles routing, execution, and result delivery.
- **TypeScript-first ergonomics:** Strong typings for inputs/outputs and task
  contracts enable safer refactors and better DX.
- **Framework-agnostic:** Works with React, Vue, Svelte, Node BFFs, and
  microservices—no UI or server framework lock-in.
- **Edge & cloud ready:** Execute locally for latency and privacy, or remotely
  for scale—choose per task or per environment.
- **Privacy & compliance by design:** Keep sensitive steps client-side and send
  only minimal/aggregated payloads to remote services.
- **Offline-first fallbacks:** Degrade gracefully when the network is flaky by
  preferring local/worker tasks and syncing later.
- **Testable by construction:** Backends are interfaces—mock them in unit tests
  and verify routing logic with minimal boilerplate.
- **Minimal surface area:** Small, focused API; explicit task registration and
  execution—no runtime magic.
- **Extensible transports:** Designed to accommodate new transports like WebRTC
  and backends like WASM without breaking changes.
- **Observability hooks (DIY-friendly):** Centralize logging, metrics, and error
  handling around a single task execution point.
- **Cost-aware execution:** Keep cheap preprocessing local; reserve remote calls
  for high-value or heavy workloads to control cloud spend.
- **Secure by default patterns:** Encourage explicit task allowlists
  (canRunTasks), schema validation, and authenticated remote endpoints.
