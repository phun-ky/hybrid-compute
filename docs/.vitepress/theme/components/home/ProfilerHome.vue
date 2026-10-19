<script setup lang="ts">
import { withBase } from 'vitepress';
import { computed, ref } from 'vue';

import {
  PACKAGES,
  READOUTS,
  ROUTE,
  ROUTE_NOTES,
  STRATEGIES,
  USE_CASES,
  type Strategy
} from './homeData';

type Slice = {
  from: number;
  to: number;
  label: string;
  kind: 'work' | 'blocking' | 'net' | 'small';
};

const strategy = ref<Strategy>('local');
const route = computed(() => ROUTE[strategy.value]);

// An illustrative timeline (not measured): positions are percentages
const tracks = computed(() => {
  const r = route.value;
  const main: Slice[] = [{ from: 1, to: 5, label: 'click', kind: 'small' }];
  const worker: Slice[] = [];
  const remote: Slice[] = [];

  if (r === 'local') {
    main.push({
      from: 8,
      to: 70,
      label: "runTask('resizeImage') blocks the main thread",
      kind: 'blocking'
    });
    main.push({ from: 71, to: 78, label: 'render', kind: 'small' });
  } else if (r === 'worker') {
    main.push({ from: 8, to: 11, label: 'post', kind: 'small' });
    main.push({ from: 66, to: 69, label: 'resolve', kind: 'small' });
    main.push({ from: 70, to: 76, label: 'render', kind: 'small' });
    worker.push({
      from: 12,
      to: 64,
      label: 'resizeImage in resize.worker.js',
      kind: 'work'
    });
  } else {
    main.push({ from: 8, to: 11, label: 'fetch', kind: 'small' });
    main.push({ from: 82, to: 85, label: 'resolve', kind: 'small' });
    main.push({ from: 86, to: 92, label: 'render', kind: 'small' });
    remote.push({ from: 12, to: 28, label: 'request', kind: 'net' });
    remote.push({
      from: 28,
      to: 66,
      label: 'resizeImage on the server',
      kind: 'work'
    });
    remote.push({ from: 66, to: 80, label: 'response', kind: 'net' });
  }

  return [
    { name: 'Main thread', slices: main },
    { name: 'Worker', slices: worker },
    { name: 'Remote', slices: remote }
  ];
});

const frames = computed(() =>
  Array.from({ length: 24 }, (_, i) => {
    const at = (i / 24) * 100;
    const dropped = route.value === 'local' && at >= 8 && at < 70;
    return { i, dropped };
  })
);

const sliceStyle = (s: Slice) => ({
  left: `${s.from}%`,
  width: `${s.to - s.from}%`
});
</script>

<template>
  <div class="hp">
    <section class="d-wrap hero">
      <p class="d-mono eyebrow">hybrid-compute · local, worker, remote</p>
      <h1>
        Keep the main thread free.<br /><span
          >Run each task where it fits.</span
        >
      </h1>
      <p class="lede">
        Register a task once and let <code>runTask()</code> send it to the main
        thread, a Web Worker or a remote service over HTTP or WebSocket. Your
        code stays the same; only the strategy changes.
      </p>
      <div class="actions">
        <a class="btn primary" :href="withBase('/guide/introduction/')"
          >Get started</a
        >
        <a class="btn" :href="withBase('/api/')">API reference</a>
        <a class="btn" href="https://github.com/phun-ky/hybrid-compute"
          >GitHub</a
        >
      </div>
    </section>

    <section class="d-wrap">
      <div class="profile">
        <div class="toolbar">
          <span class="d-mono rec" aria-hidden="true">●</span>
          <span class="d-mono"
            >compute.runTask('resizeImage', blob, '{{ strategy }}')</span
          >
          <div class="seg" role="group" aria-label="Strategy">
            <button
              v-for="s in STRATEGIES"
              :key="s"
              type="button"
              class="d-mono"
              :aria-pressed="s === strategy"
              @click="strategy = s"
            >
              {{ s }}
            </button>
          </div>
        </div>

        <div class="ruler" aria-hidden="true"></div>
        <div class="row">
          <div class="label d-mono">Frames</div>
          <div class="lane frames">
            <span
              v-for="f in frames"
              :key="f.i"
              :class="['frame', { dropped: f.dropped }]"
            ></span>
          </div>
        </div>
        <div v-for="t in tracks" :key="t.name" class="row">
          <div class="label d-mono">{{ t.name }}</div>
          <div class="lane">
            <span v-if="!t.slices.length" class="idle d-mono">idle</span>
            <span
              v-for="s in t.slices"
              :key="s.label + s.from"
              :class="['slice', s.kind]"
              :style="sliceStyle(s)"
              :title="s.label"
            >
              <span class="d-mono">{{
                s.kind === 'small' ? '' : s.label
              }}</span>
            </span>
          </div>
        </div>

        <div class="summary">
          <div>
            <div class="d-mono sk">Runs on</div>
            <div class="v">
              {{ route }}
              <small class="d-mono">{{ READOUTS[route].thread }}</small>
            </div>
          </div>
          <div>
            <div class="d-mono sk">Main thread</div>
            <div :class="['v', route === 'local' ? 'warn' : 'good']">
              {{ route === 'local' ? 'Blocked' : 'Free' }}
            </div>
          </div>
          <div>
            <div class="d-mono sk">Frames</div>
            <div :class="['v', route === 'local' ? 'warn' : 'good']">
              {{ route === 'local' ? 'Dropped' : 'On time' }}
            </div>
          </div>
          <div class="why d-mono">
            <div v-for="n in ROUTE_NOTES[strategy]" :key="n">{{ n }}</div>
            <div class="note">Illustrative timeline, not a measurement.</div>
          </div>
        </div>
      </div>
    </section>

    <section class="d-wrap block">
      <h2>Packages</h2>
      <p class="sub">Use core with any mix of the three backends.</p>
      <div class="table-box">
        <table>
          <thead>
            <tr>
              <th scope="col">Package</th>
              <th scope="col">Runs on</th>
              <th scope="col">What it does</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in PACKAGES" :key="p.id">
              <td>
                <a class="d-mono" :href="withBase(p.link)">{{ p.name }}</a>
              </td>
              <td class="d-mono">
                {{
                  p.id === 'core'
                    ? 'anywhere'
                    : READOUTS[p.id as 'local'].thread
                }}
              </td>
              <td>{{ p.text }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="d-wrap block">
      <h2>One call, any backend</h2>
      <p class="sub">Change the strategy, not the code.</p>
      <pre class="code d-mono"><span class="c">// app.ts</span>
<span class="k">const</span> compute = createHybridCompute({ local, worker, remote });

<span class="k">await</span> compute.runTask(<span class="s">'resizeImage'</span>, blob);            <span class="c">// auto: worker, local, then remote</span>
<span class="k">await</span> compute.runTask(<span class="s">'resizeImage'</span>, blob, <span class="s">'worker'</span>);  <span class="c">// always off the main thread</span>
<span class="k">await</span> compute.runTask(<span class="s">'summarise'</span>, text, <span class="s">'remote'</span>);  <span class="c">// on your server</span></pre>
    </section>

    <section class="d-wrap block last">
      <h2>Why route tasks</h2>
      <div class="cases">
        <article v-for="u in USE_CASES" :key="u.title">
          <span class="bar" aria-hidden="true"></span>
          <h3>{{ u.title }}</h3>
          <p>{{ u.text }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.d-wrap {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 32px;
}
@media (max-width: 640px) {
  .d-wrap {
    padding: 0 16px;
  }
}
.d-mono {
  font-family: var(--d-mono);
}
.hp {
  font-family: var(--d-font);
  color: var(--d-muted);
}
.hero {
  padding-top: 80px;
  max-width: 1000px;
  margin-left: max(0px, calc((100% - 1240px) / 2));
}
.eyebrow {
  margin: 0 0 18px;
  font-size: 13px;
  color: var(--d-faint);
}
h1 {
  margin: 0;
  font-size: clamp(40px, 5.4vw, 68px);
  line-height: 1.04;
  font-weight: 600;
  letter-spacing: -0.035em;
  color: var(--d-text);
}
h1 span {
  color: var(--d-accent);
}
.lede {
  margin: 24px 0 0;
  font-size: 19px;
  line-height: 1.6;
  max-width: 60ch;
}
.lede code {
  font-family: var(--d-mono);
  font-size: 16px;
  color: var(--d-text);
  background: var(--d-bg3);
  padding: 2px 6px;
  border-radius: 4px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 30px;
}
.btn {
  padding: 12px 18px;
  border-radius: 6px;
  border: 1px solid var(--d-line);
  color: var(--d-text);
  font-weight: 500;
  text-decoration: none;
  background: var(--d-bg2);
}
.btn:hover {
  border-color: var(--d-accent);
}
.btn.primary {
  background: var(--d-accent);
  border-color: var(--d-accent);
  color: var(--d-on-accent);
}
.profile {
  margin-top: 56px;
  border: 1px solid var(--d-line);
  border-radius: 10px;
  background: var(--d-bg2);
  overflow: hidden;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--d-line);
  font-size: 13px;
  color: var(--d-text);
}
.rec {
  color: var(--d-blocking);
}
.seg {
  display: flex;
  margin-left: auto;
  border: 1px solid var(--d-line);
  border-radius: 6px;
  overflow: hidden;
}
.seg button {
  min-height: 44px;
  min-width: 72px;
  padding: 0 12px;
  border: 0;
  border-right: 1px solid var(--d-line);
  background: transparent;
  color: var(--d-muted);
  font-size: 13px;
  cursor: pointer;
}
.seg button:last-child {
  border-right: 0;
}
.seg button[aria-pressed='true'] {
  background: var(--d-accent-soft);
  color: var(--d-accent);
  font-weight: 500;
}
.ruler {
  height: 22px;
  margin-left: 140px;
  border-bottom: 1px solid var(--d-line);
  background-image:
    repeating-linear-gradient(90deg, var(--d-tick) 0 1px, transparent 1px 10%),
    repeating-linear-gradient(90deg, var(--d-tick) 0 1px, transparent 1px 2%);
  background-size:
    100% 22px,
    100% 8px;
  background-repeat: no-repeat;
  background-position: bottom;
}
.row {
  display: flex;
  border-bottom: 1px solid var(--d-line);
}
.label {
  flex: 0 0 140px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  font-size: 12px;
  color: var(--d-faint);
  border-right: 1px solid var(--d-line);
}
.lane {
  position: relative;
  flex: 1 1 auto;
  height: 52px;
  min-width: 0;
}
.frames {
  display: flex;
  gap: 3px;
  align-items: center;
  padding: 0 3px;
  height: 30px;
}
.frame {
  flex: 1 1 0;
  height: 14px;
  border-radius: 2px;
  background: var(--d-accent);
  opacity: 0.85;
}
.frame.dropped {
  background: repeating-linear-gradient(
    135deg,
    var(--d-blocking) 0 3px,
    transparent 3px 6px
  );
  opacity: 1;
}
.idle {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: var(--d-faint);
}
.slice {
  position: absolute;
  top: 10px;
  bottom: 10px;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 0 8px;
  font-size: 12px;
  white-space: nowrap;
  transition:
    left 0.35s,
    width 0.35s;
}
.slice.work {
  background: var(--d-accent);
  color: var(--d-on-accent);
}
.slice.small {
  background: var(--d-accent);
  opacity: 0.55;
}
.slice.blocking {
  background: repeating-linear-gradient(
    135deg,
    var(--d-blocking) 0 6px,
    color-mix(in srgb, var(--d-blocking) 82%, var(--d-bg)) 6px 12px
  );
  color: var(--d-on-blocking);
  font-weight: 600;
}
.slice.net {
  border: 1px dashed var(--d-faint);
  color: var(--d-muted);
  background: transparent;
}
.summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0;
}
.summary > div {
  padding: 16px 18px;
  border-right: 1px solid var(--d-line);
}
.sk {
  font-size: 12px;
  color: var(--d-faint);
}
.v {
  margin-top: 6px;
  font-size: 22px;
  font-weight: 600;
  color: var(--d-text);
  letter-spacing: -0.01em;
}
.v small {
  font-size: 12px;
  font-weight: 400;
  color: var(--d-faint);
  margin-left: 6px;
}
.v.warn {
  color: var(--d-blocking);
}
.v.good {
  color: var(--d-accent);
}
.why {
  font-size: 12px;
  line-height: 1.8;
  grid-column: span 2;
}
.note {
  color: var(--d-faint);
  margin-top: 4px;
}
.block {
  padding-top: 88px;
}
.block.last {
  padding-bottom: 96px;
}
h2 {
  margin: 0;
  font-size: 32px;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: var(--d-text);
  border: 0;
  padding: 0;
}
.sub {
  margin: 8px 0 28px;
  font-size: 17px;
}
.table-box {
  overflow-x: auto;
  border: 1px solid var(--d-line);
  border-radius: 10px;
}
table {
  width: 100%;
  /* On a phone the table scrolls sideways in .table-box instead of squeezing */
  min-width: 640px;
  border-collapse: collapse;
  font-size: 15px;
  display: table;
  margin: 0;
}
th {
  text-align: left;
  font-family: var(--d-mono);
  font-size: 12px;
  font-weight: 500;
  color: var(--d-faint);
  padding: 12px 16px;
  background: var(--d-bg3);
  border: 0;
}
td {
  padding: 14px 16px;
  border: 0;
  border-top: 1px solid var(--d-line);
  vertical-align: top;
}
td a {
  color: var(--d-accent);
  text-decoration: none;
  font-size: 14px;
}
tr:nth-child(2n) {
  background: transparent;
}
.code {
  margin: 0;
  padding: 22px 24px;
  border: 1px solid var(--d-line);
  border-left: 3px solid var(--d-accent);
  border-radius: 10px;
  background: var(--d-bg2);
  font-size: 14px;
  line-height: 1.8;
  color: var(--d-text);
  overflow-x: auto;
}
.k {
  color: var(--d-accent);
}
.s {
  color: var(--d-blocking);
}
.c {
  color: var(--d-faint);
}
.cases {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 28px;
}
.cases article {
  padding: 22px;
  border: 1px solid var(--d-line);
  border-radius: 10px;
  background: var(--d-bg2);
}
.bar {
  display: block;
  width: 64px;
  height: 6px;
  border-radius: 2px;
  background: var(--d-accent);
  margin-bottom: 18px;
}
.cases h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--d-text);
}
.cases p {
  margin: 0;
  line-height: 1.6;
}
@media (max-width: 640px) {
  .label {
    flex-basis: 92px;
  }
  .ruler {
    margin-left: 92px;
  }
  .why {
    grid-column: auto;
  }
}
</style>
