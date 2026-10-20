<!-- How core picks a backend for runTask; styles are the arch-* classes in style.css -->
<template>
  <figure class="arch">
    <svg
      viewBox="0 0 780 330"
      role="img"
      aria-labelledby="dispatch-title dispatch-desc"
    >
      <title id="dispatch-title">How runTask reaches a backend</title>
      <desc id="dispatch-desc">
        The application calls runTask on core. With the local, worker or remote
        strategy, core uses that backend if it is configured, without asking
        canRun. With auto, it uses the first backend whose canRun returns true,
        in the order worker, local, remote. If no backend matches, runTask
        rejects with an Error.
      </desc>
      <defs>
        <marker
          id="dispatch-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path class="arch-head" d="M0 0L10 5L0 10z" />
        </marker>
        <marker
          id="dispatch-arrow-error"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path class="arch-head-error" d="M0 0L10 5L0 10z" />
        </marker>
      </defs>

      <rect class="arch-box" x="10" y="135" width="160" height="70" rx="6" />
      <text class="arch-label" x="90" y="162" text-anchor="middle">
        Application
      </text>
      <text class="arch-mono" x="90" y="180" text-anchor="middle">
        runTask(name,
      </text>
      <text class="arch-mono" x="90" y="196" text-anchor="middle">
        input, strategy)
      </text>
      <path
        class="arch-line"
        d="M170 170 H208"
        marker-end="url(#dispatch-arrow)"
      />

      <rect
        class="arch-box arch-core"
        x="210"
        y="20"
        width="250"
        height="300"
        rx="6"
      />
      <text class="arch-label" x="335" y="48" text-anchor="middle">core</text>
      <text class="arch-mono arch-strong" x="226" y="80">
        local · worker · remote
      </text>
      <text class="arch-mono" x="226" y="98">that backend, if it is set,</text>
      <text class="arch-mono" x="226" y="114">without asking canRun</text>
      <text class="arch-mono arch-strong" x="226" y="146">auto</text>
      <text class="arch-mono" x="226" y="164">the first backend whose</text>
      <text class="arch-mono" x="226" y="180">canRun(name) is true,</text>
      <text class="arch-mono" x="226" y="196">in order: worker, local,</text>
      <text class="arch-mono" x="226" y="212">then remote</text>
      <text class="arch-mono arch-strong" x="226" y="248">no match</text>
      <text class="arch-mono" x="226" y="266">rejects with an Error</text>

      <path
        class="arch-line"
        d="M460 48 H538"
        marker-end="url(#dispatch-arrow)"
      />
      <text class="arch-mono" x="499" y="41" text-anchor="middle">
        auto 1st
      </text>
      <path
        class="arch-line"
        d="M460 124 H538"
        marker-end="url(#dispatch-arrow)"
      />
      <text class="arch-mono" x="499" y="117" text-anchor="middle">
        auto 2nd
      </text>
      <path
        class="arch-line"
        d="M460 200 H538"
        marker-end="url(#dispatch-arrow)"
      />
      <text class="arch-mono" x="499" y="193" text-anchor="middle">
        auto 3rd
      </text>
      <path
        class="arch-line arch-error"
        d="M460 282 H538"
        marker-end="url(#dispatch-arrow-error)"
      />

      <rect class="arch-box" x="540" y="20" width="230" height="56" rx="6" />
      <text class="arch-label" x="655" y="44" text-anchor="middle">worker</text>
      <text class="arch-mono" x="655" y="63" text-anchor="middle">
        Web Worker · postMessage
      </text>

      <rect class="arch-box" x="540" y="96" width="230" height="56" rx="6" />
      <text class="arch-label" x="655" y="120" text-anchor="middle">local</text>
      <text class="arch-mono" x="655" y="139" text-anchor="middle">
        same thread
      </text>

      <rect class="arch-box" x="540" y="172" width="230" height="56" rx="6" />
      <text class="arch-label" x="655" y="196" text-anchor="middle">
        remote
      </text>
      <text class="arch-mono" x="655" y="215" text-anchor="middle">
        fetch or WebSocket
      </text>

      <rect
        class="arch-box arch-error"
        x="540"
        y="254"
        width="230"
        height="56"
        rx="6"
      />
      <text class="arch-label" x="655" y="278" text-anchor="middle">Error</text>
      <text
        class="arch-mono arch-error-text"
        x="655"
        y="297"
        text-anchor="middle"
      >
        No backend available
      </text>
    </svg>
    <figcaption>
      Every backend returns a Promise of the task's output.
    </figcaption>
  </figure>
</template>
