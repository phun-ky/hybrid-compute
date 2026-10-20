<!-- One task through the worker backend; styles are the arch-* classes in style.css -->
<template>
  <figure class="arch">
    <svg
      viewBox="0 0 780 290"
      role="img"
      aria-labelledby="worker-title worker-desc"
    >
      <title id="worker-title">A task through the worker backend</title>
      <desc id="worker-desc">
        Your code calls runTask on ThreadedCompute, which posts a message with
        the task, input and an id to your worker script. The worker script posts
        back the id with a result or an error, and ThreadedCompute resolves or
        rejects the Promise.
      </desc>
      <defs>
        <marker
          id="worker-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path class="arch-head" d="M0 0L10 5L0 10z" />
        </marker>
      </defs>

      <rect class="arch-box" x="15" y="10" width="190" height="48" rx="6" />
      <text class="arch-label" x="110" y="31" text-anchor="middle">
        Your code
      </text>
      <text class="arch-mono" x="110" y="49" text-anchor="middle">
        main thread
      </text>

      <rect
        class="arch-box arch-core"
        x="295"
        y="10"
        width="190"
        height="48"
        rx="6"
      />
      <text class="arch-label" x="390" y="31" text-anchor="middle">
        ThreadedCompute
      </text>
      <text class="arch-mono" x="390" y="49" text-anchor="middle">
        @hybrid-compute/worker
      </text>

      <rect class="arch-box" x="575" y="10" width="190" height="48" rx="6" />
      <text class="arch-label" x="670" y="31" text-anchor="middle">
        Worker script
      </text>
      <text class="arch-mono" x="670" y="49" text-anchor="middle">
        your file
      </text>

      <path class="arch-lifeline" d="M110 58 V280" />
      <path class="arch-lifeline" d="M390 58 V280" />
      <path class="arch-lifeline" d="M670 58 V280" />

      <text class="arch-mono arch-strong" x="250" y="92" text-anchor="middle">
        runTask('resize', input)
      </text>
      <path
        class="arch-line"
        d="M110 100 H386"
        marker-end="url(#worker-arrow)"
      />

      <text class="arch-mono arch-strong" x="530" y="144" text-anchor="middle">
        postMessage({ task, input, id })
      </text>
      <path
        class="arch-line"
        d="M390 152 H666"
        marker-end="url(#worker-arrow)"
      />

      <text class="arch-mono arch-strong" x="530" y="196" text-anchor="middle">
        { id, result } or { id, error }
      </text>
      <path
        class="arch-line arch-dashed"
        d="M670 204 H394"
        marker-end="url(#worker-arrow)"
      />

      <text class="arch-mono arch-strong" x="250" y="248" text-anchor="middle">
        resolve(result) or reject(error)
      </text>
      <path
        class="arch-line arch-dashed"
        d="M390 256 H114"
        marker-end="url(#worker-arrow)"
      />
    </svg>
    <figcaption>
      The id matches each reply to its call, so several tasks can be in flight
      at once.
    </figcaption>
  </figure>
</template>
