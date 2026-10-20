<!-- The two remote transports and their messages; styles are the arch-* classes in style.css -->
<template>
  <figure class="arch">
    <svg
      viewBox="0 0 780 300"
      role="img"
      aria-labelledby="remote-title remote-desc"
    >
      <title id="remote-title">The remote backend's two transports</title>
      <desc id="remote-desc">
        With fetch, RemoteCompute posts the task and input as JSON to the
        endpoint you configured, and reads a result or an error from the
        response. With WebSocket, it sends the task, input and an id on a socket
        it opens for the first task and reuses, and matches replies with the
        same id, carrying a result or an error. Both reject with a
        RemoteTaskError on failure, and time out after 30 seconds by default.
      </desc>
      <defs>
        <marker
          id="remote-arrow"
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

      <rect class="arch-panel" x="10" y="10" width="370" height="280" rx="8" />
      <text class="arch-mono arch-strong" x="26" y="34">
        transport: 'fetch'
      </text>
      <rect
        class="arch-box arch-core"
        x="50"
        y="50"
        width="290"
        height="50"
        rx="6"
      />
      <text class="arch-label" x="195" y="72" text-anchor="middle">
        RemoteCompute
      </text>
      <text class="arch-mono" x="195" y="90" text-anchor="middle">
        runTask(name, input)
      </text>
      <path
        class="arch-line"
        d="M80 100 V216"
        marker-end="url(#remote-arrow)"
      />
      <text class="arch-mono arch-strong" x="90" y="150">
        POST { task, input }
      </text>
      <path
        class="arch-line arch-dashed"
        d="M310 220 V104"
        marker-end="url(#remote-arrow)"
      />
      <text class="arch-mono arch-strong" x="300" y="185" text-anchor="end">
        { result, error? }
      </text>
      <rect class="arch-box" x="50" y="220" width="290" height="50" rx="6" />
      <text class="arch-label" x="195" y="242" text-anchor="middle">
        Your endpoint
      </text>
      <text class="arch-mono" x="195" y="260" text-anchor="middle">
        the URL you configured
      </text>

      <rect class="arch-panel" x="400" y="10" width="370" height="280" rx="8" />
      <text class="arch-mono arch-strong" x="416" y="34">
        transport: 'websocket'
      </text>
      <rect
        class="arch-box arch-core"
        x="440"
        y="50"
        width="290"
        height="50"
        rx="6"
      />
      <text class="arch-label" x="585" y="72" text-anchor="middle">
        RemoteCompute
      </text>
      <text class="arch-mono" x="585" y="90" text-anchor="middle">
        runTask(name, input)
      </text>
      <path
        class="arch-line"
        d="M470 100 V216"
        marker-end="url(#remote-arrow)"
      />
      <text class="arch-mono arch-strong" x="480" y="150">
        send { task, input, id }
      </text>
      <path
        class="arch-line arch-dashed"
        d="M700 220 V104"
        marker-end="url(#remote-arrow)"
      />
      <text class="arch-mono arch-strong" x="690" y="185" text-anchor="end">
        { id, result, error? }
      </text>
      <rect class="arch-box" x="440" y="220" width="290" height="50" rx="6" />
      <text class="arch-label" x="585" y="242" text-anchor="middle">
        Your endpoint
      </text>
      <text class="arch-mono" x="585" y="260" text-anchor="middle">
        socket opened by the first task
      </text>
    </svg>
    <figcaption>
      An error in the reply, a failed request or the timeout (30 seconds by
      default) rejects the task with a <code>RemoteTaskError</code>.
    </figcaption>
  </figure>
</template>
