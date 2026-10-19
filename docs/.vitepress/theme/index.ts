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

import ProfilerHome from './components/home/ProfilerHome.vue';

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    // Keep the default theme's global components (such as <Badge>)
    DefaultTheme.enhanceApp?.(ctx);
    ctx.app.component('ProfilerHome', ProfilerHome);
  }
} satisfies Theme;
