import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme-without-fonts';

// Self-hosted fonts: the docs site loads nothing from other origins
import '@fontsource/geist/400.css';
import '@fontsource/geist/500.css';
import '@fontsource/geist/600.css';
import '@fontsource/geist-mono/400.css';
import '@fontsource/geist-mono/500.css';
import 'virtual:group-icons.css';
import './style.css';

import DispatchDiagram from './components/diagrams/DispatchDiagram.vue';
import PackagesDiagram from './components/diagrams/PackagesDiagram.vue';
import RemoteDiagram from './components/diagrams/RemoteDiagram.vue';
import WorkerDiagram from './components/diagrams/WorkerDiagram.vue';
import ProfilerHome from './components/home/ProfilerHome.vue';

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    // Keep the default theme's global components (such as <Badge>)
    DefaultTheme.enhanceApp?.(ctx);
    ctx.app.component('ProfilerHome', ProfilerHome);
    // Diagrams shared by the About and architecture pages
    ctx.app.component('DispatchDiagram', DispatchDiagram);
    ctx.app.component('PackagesDiagram', PackagesDiagram);
    ctx.app.component('RemoteDiagram', RemoteDiagram);
    ctx.app.component('WorkerDiagram', WorkerDiagram);
  }
} satisfies Theme;
