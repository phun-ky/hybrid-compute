<div><img alt="hybrid-compute logo" src="https://raw.githubusercontent.com/phun-ky/hybrid-compute/main/public/logo-hybrid-compute-horizontal-colored-package.svg?raw=true" style="max-height:32px;"/></div>

# [**@hybrid-compute**](https://github.com/hybrid-compute)

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-green.svg)](http://makeapullrequest.com)
[![SemVer 2.0](https://img.shields.io/badge/SemVer-2.0-green.svg)](http://semver.org/spec/v2.0.0.html)
![issues](https://img.shields.io/github/issues/phun-ky/hybrid-compute)
![GitHub Repo stars](https://img.shields.io/github/stars/phun-ky/hybrid-compute)
[![codecov](https://codecov.io/gh/phun-ky/hybrid-compute/graph/badge.svg?token=VA91DL7ZLZ)](https://codecov.io/gh/phun-ky/hybrid-compute)
[![build](https://github.com/phun-ky/hybrid-compute/actions/workflows/check.yml/badge.svg)](https://github.com/phun-ky/hybrid-compute/actions/workflows/check.yml)

## About

## Table of Contents<!-- omit from toc -->

- [@hybrid-compute](#hybrid-compute)
  - [About](#about)
  - [Usage](#usage)
    - [High-Level Package Architecture](#high-level-package-architecture)
    - [Task Dispatch Flow (HybridCompute Core)](#task-dispatch-flow-hybridcompute-core)
    - [Threaded Worker Lifecycle](#threaded-worker-lifecycle)
    - [Remote Compute Flow (WebSocket or Fetch)](#remote-compute-flow-websocket-or-fetch)
  - [API](#api)
  - [Development](#development)
  - [Contributing](#contributing)
  - [License](#license)
  - [Changelog](#changelog)
  - [Sponsor me](#sponsor-me)

## Usage

### High-Level Package Architecture

```mermaid
graph TD
  subgraph HybridCompute
    HC[HybridCompute Core]
    HC -->|uses| Local[Local Backend]
    HC -->|uses| Worker[Threaded Backend]
    HC -->|uses| Remote[Remote Backend]
  end

  Local -.->|executes task locally| TaskLocal[ComputeTask]
  Worker -.->|delegates task to| WebWorker
  Remote -.->|calls| HTTP[HTTP API] & WS[WebSocket API]
```

### Task Dispatch Flow (HybridCompute Core)

```mermaid
flowchart TD
  A["runTask(taskName, input, strategy)"] --> B{Strategy}
  B -->|local| C[local.runTask]
  B -->|worker| D[worker.runTask]
  B -->|remote| E[remote.runTask]
  B -->|auto| F{canRun?}

  F -->|worker| D
  F -->|local| C
  F -->|remote| E
  D & C & E --> G[Promise<Output>]
```

### Threaded Worker Lifecycle

```mermaid
sequenceDiagram
  participant MainThread
  participant ThreadedCompute
  participant WebWorker

  MainThread->>ThreadedCompute: runTask("task", input)
  ThreadedCompute->>WebWorker: postMessage({ id, task, input })
  WebWorker-->>ThreadedCompute: postMessage({ id, result })
  ThreadedCompute-->>MainThread: resolve(result)

```

### Remote Compute Flow (WebSocket or Fetch)

```mermaid
flowchart TD
  subgraph RemoteCompute
    RC["runTask()"]
    style RC fill:#eef,stroke:#333,stroke-width:1px
    RC --> T{Transport}
    T -->|fetch| F[POST /compute]
    T -->|websocket| WS["WebSocket.send()"]
  end

  F --> JSON["JSON-RPC {task, input}"]
  WS --> JSON
  JSON -->|response| RC

```

## API

---

## Development

```shell-session
// Build
$ npm run build
// Run dev
$ npm run dev
// Test
$ npm test
```

## Contributing

Want to contribute? Please read the
[CONTRIBUTING.md](https://github.com/phun-ky/hybrid-compute/blob/main/CONTRIBUTING.md)
and
[CODE_OF_CONDUCT.md](https://github.com/phun-ky/hybrid-compute/blob/main/CODE_OF_CONDUCT.md)

## License

This project is licensed under the MIT License - see the
[LICENSE](https://github.com/phun-ky/hybrid-compute/blob/main/LICENSE) file for
details.

## Changelog

See the
[CHANGELOG.md](https://github.com/phun-ky/hybrid-compute/blob/main/CHANGELOG.md)
for details on the latest updates.

## Sponsor me

I'm an Open Source evangelist, creating stuff that does not exist yet to help
get rid of secondary activities and to enhance systems already in place, be it
documentation or web sites.

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

> Last updated 2025-05-29T12:50:11.420Z

## Modules

- [core/src](core/src/README.md)
- [core/src/types](core/src/types/README.md)
- [local/src](local/src/README.md)
- [remote/src](remote/src/README.md)
- [remote/src/types](remote/src/types/README.md)
- [worker/src](worker/src/README.md)
- [worker/src/types](worker/src/types/README.md)

---

**Contributing**

Want to contribute? Please read the
[CONTRIBUTING.md](https://github.com/phun-ky/hybrid-compute/blob/main/CONTRIBUTING.md)
and
[CODE_OF_CONDUCT.md](https://github.com/phun-ky/hybrid-compute/blob/main/CODE_OF_CONDUCT.md)

**Sponsor me**

I'm an Open Source evangelist, creating stuff that does not exist yet to help
get rid of secondary activities and to enhance systems already in place, be it
documentation or web sites.

The sponsorship is an unique opportunity to alleviate more hours for me to
maintain my projects, create new ones and contribute to the large community
we're all part of :)

[Support me on GitHub Sponsors](https://github.com/sponsors/phun-ky).

---

This project created by [Alexander Vassbotn Røyne-Helgesen](http://phun-ky.net)
is licensed under a [MIT License](https://choosealicense.com/licenses/mit/).
