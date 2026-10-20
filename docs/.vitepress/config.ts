/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineConfig } from 'vitepress';
import {
  groupIconMdPlugin,
  groupIconVitePlugin
} from 'vitepress-plugin-group-icons';

// import path from 'node:path';
import { fileURLToPath } from 'node:url';

import corePackage from '../../packages/core/package.json' with { type: 'json' };
import typedocSidebar from '../api/typedoc-sidebar.json';

import darkTheme from './shiki/accessible-aa-dark-shiki.json' with { type: 'json' };
import lightTheme from './shiki/accessible-aa-light-shiki.json' with { type: 'json' };

// const here = fileURLToPath(new URL('.', import.meta.url));
// const root = path.resolve(here, '../../..');

export default defineConfig({
  base: '/hybrid-compute/',
  lang: 'en-GB',
  // Dark first, like a profiler; the toggle switches to light
  appearance: 'dark',
  head: [
    // head links aren't prefixed with base, so they carry /hybrid-compute/
    [
      'link',
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/hybrid-compute/logo/favicon.svg'
      }
    ],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/hybrid-compute/logo/favicon-32.png'
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-icon',
        href: '/hybrid-compute/logo/apple-touch-icon.png'
      }
    ],
    ['meta', { property: 'og:image:width', content: '2400' }],
    ['meta', { property: 'og:image:height', content: '1260' }],
    [
      'meta',
      {
        property: 'og:image:alt',
        content:
          'The Hybrid Compute logo, three lanes of work, with the name and the tagline'
      }
    ],
    [
      'meta',
      { property: 'og:url', content: 'https://phun-ky.net/hybrid-compute/' }
    ],
    ['meta', { property: 'og:type', content: 'website' }],
    [
      'meta',
      {
        property: 'og:title',
        content: 'Hybrid Compute'
      }
    ],
    [
      'meta',
      {
        property: 'og:description',
        content:
          'Run compute tasks wherever they run best - local, threaded, or remote - with a pluggable backend architecture'
      }
    ],
    [
      'meta',
      {
        property: 'og:site_name',
        content: 'Hybrid Compute'
      }
    ],
    ['meta', { property: 'og:locale', content: 'en_GB' }],
    [
      'meta',
      {
        property: 'og:image',
        content: 'https://phun-ky.net/hybrid-compute/logo/social@2x.png'
      }
    ],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { property: 'twitter:domain', content: 'phun-ky.net' }],
    [
      'meta',
      {
        property: 'twitter:url',
        content: 'https://phun-ky.net/hybrid-compute/'
      }
    ],
    [
      'meta',
      {
        name: 'twitter:title',
        content: 'Hybrid Compute'
      }
    ],
    [
      'meta',
      {
        name: 'twitter:description',
        content:
          'Run compute tasks wherever they run best - local, threaded, or remote - with a pluggable backend architecture'
      }
    ],
    [
      'meta',
      {
        name: 'twitter:image',
        content: 'https://phun-ky.net/hybrid-compute/logo/social@2x.png'
      }
    ]
  ],

  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,
  description:
    'Run compute tasks wherever they run best - local, threaded, or remote - with a pluggable backend architecture',
  title: 'Hybrid Compute',
  themeConfig: {
    search: {
      provider: 'local'
    },
    editLink: {
      pattern: 'https://github.com/phun-ky/hybrid-compute/edit/main/docs/:path',
      text: 'Suggest changes to this page'
    },
    siteTitle: 'Hybrid Compute',
    logo: {
      light: '/logo/mark.svg',
      dark: '/logo/mark-dark.svg',
      alt: 'Hybrid Compute logo'
    },
    nav: [
      { text: 'Guide', link: '/guide/introduction/' },
      { text: 'Reference', link: '/api/', activeMatch: '/api/' },
      { text: 'Sponsor', link: '/sponsor' },
      {
        text: corePackage.version,
        items: [
          {
            text: 'Changelogs',
            items: [
              {
                text: 'Core',
                link: 'https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/README.md'
              },
              {
                text: 'Local',
                link: 'https://github.com/phun-ky/hybrid-compute/blob/main/packages/local/README.md'
              },
              {
                text: 'Remote',
                link: 'https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/README.md'
              },
              {
                text: 'Worker',
                link: 'https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/README.md'
              }
            ]
          },
          {
            text: 'Contributing',
            link: 'https://github.com/phun-ky/hybrid-compute/blob/main/CONTRIBUTING.md'
          }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/phun-ky/hybrid-compute' }
    ],
    footer: {
      message:
        'Released under the <a href="https://choosealicense.com/licenses/mit/" target="_blank" rel="nofollow noreferrer">MIT License</a>.',
      copyright:
        'Copyright © 2025-present <a href="https://phun-ky.net/">Alexander Vassbotn Røyne-Helgesen</a>'
    },
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          collapsed: false,
          items: [
            {
              text: 'About Hybrid Compute',
              link: '/guide/introduction/about'
            },
            { text: 'Getting started', link: '/guide/introduction/' }
          ]
        },
        {
          text: 'Usage',
          collapsed: false,
          items: [
            { text: 'Local', link: '/guide/usage/local' },
            { text: 'Remote', link: '/guide/usage/remote' },
            { text: 'Worker', link: '/guide/usage/worker' },
            { text: 'WebAssembly', link: '/guide/usage/wasm' }
          ]
        },
        {
          text: 'Releases',
          collapsed: false,
          items: [
            { text: 'Release notes', link: '/guide/releases/' },
            { text: '1.0 release notes', link: '/guide/releases/1.0' },
            { text: 'Upgrading', link: '/guide/upgrading' }
          ]
        },
        {
          text: 'Development',
          collapsed: false,
          items: [
            { text: 'Development setup', link: '/guide/development' },
            { text: 'Architecture', link: '/guide/architecture' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API',
          items: typedocSidebar.map((s) => ({
            ...s,
            collapsed: false
          }))
        }
      ]
    }
  },
  vite: {
    plugins: [groupIconVitePlugin()],
    resolve: {
      alias: [
        {
          find: /^.*\/VPSwitchAppearance\.vue$/,
          replacement: fileURLToPath(
            new URL('./theme/components/ToggleDarkMode.vue', import.meta.url)
          )
        }
      ]
    }
  },
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin);
    },

    theme: {
      dark: darkTheme as any,
      light: lightTheme as any
    },
    // (Optional) Preload themes explicitly
    shikiSetup: async (shiki) => {
      await shiki.loadTheme(darkTheme as any);
      await shiki.loadTheme(lightTheme as any);
    }
  }
});
