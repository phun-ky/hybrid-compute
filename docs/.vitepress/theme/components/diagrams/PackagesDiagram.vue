<!-- The packages and what each depends on; styles are the arch-* classes in style.css -->
<template>
  <figure class="arch">
    <svg
      viewBox="0 0 780 250"
      role="img"
      aria-labelledby="packages-title packages-desc"
    >
      <title id="packages-title">The packages and their dependencies</title>
      <desc id="packages-desc">
        The local, worker and remote packages each depend on core and implement
        its ComputeBackendInterface. Core has no runtime dependencies.
      </desc>
      <defs>
        <marker
          id="packages-arrow"
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

      <rect
        class="arch-box arch-core"
        x="255"
        y="20"
        width="270"
        height="64"
        rx="6"
      />
      <text class="arch-label" x="390" y="47" text-anchor="middle">
        @hybrid-compute/core
      </text>
      <text class="arch-mono" x="390" y="68" text-anchor="middle">
        HybridCompute · interfaces
      </text>

      <path
        class="arch-line"
        d="M135 166 L338 88"
        marker-end="url(#packages-arrow)"
      />
      <path
        class="arch-line"
        d="M390 166 V88"
        marker-end="url(#packages-arrow)"
      />
      <path
        class="arch-line"
        d="M645 166 L442 88"
        marker-end="url(#packages-arrow)"
      />

      <rect class="arch-box" x="20" y="166" width="230" height="64" rx="6" />
      <text class="arch-label" x="135" y="193" text-anchor="middle">
        @hybrid-compute/local
      </text>
      <text class="arch-mono" x="135" y="214" text-anchor="middle">
        LocalCompute
      </text>

      <rect class="arch-box" x="275" y="166" width="230" height="64" rx="6" />
      <text class="arch-label" x="390" y="193" text-anchor="middle">
        @hybrid-compute/worker
      </text>
      <text class="arch-mono" x="390" y="214" text-anchor="middle">
        ThreadedCompute
      </text>

      <rect class="arch-box" x="530" y="166" width="230" height="64" rx="6" />
      <text class="arch-label" x="645" y="193" text-anchor="middle">
        @hybrid-compute/remote
      </text>
      <text class="arch-mono" x="645" y="214" text-anchor="middle">
        RemoteCompute
      </text>
    </svg>
    <figcaption>
      Arrows point to what a package depends on. Each backend implements
      <code>ComputeBackendInterface</code> from core; core imports no backend.
    </figcaption>
  </figure>
</template>
