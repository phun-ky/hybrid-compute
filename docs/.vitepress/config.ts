/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineConfig } from 'vitepress';
import {
  groupIconMdPlugin,
  groupIconVitePlugin
} from 'vitepress-plugin-group-icons';
import { withMermaid } from 'vitepress-plugin-mermaid';

// import path from 'node:path';
import { fileURLToPath } from 'node:url';

import corePackage from '../../packages/core/package.json' with { type: 'json' };
import typedocSidebar from '../api/typedoc-sidebar.json';

import darkTheme from './shiki/accessible-aa-dark-shiki.json' with { type: 'json' };
import lightTheme from './shiki/accessible-aa-light-shiki.json' with { type: 'json' };

// const here = fileURLToPath(new URL('.', import.meta.url));
// const root = path.resolve(here, '../../..');

export default withMermaid(
  defineConfig({
    base: '/hybrid-compute/',
    mermaidPlugin: {
      class: 'mermaid'
    },
    mermaid: {
      themeVariables: {
        fontFamily:
          "'Menlo for Powerline', 'Menlo Regular for Powerline', 'DejaVu Sans Mono', Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
        fontSize: '16px'
      }
    },
    lang: 'en-GB',
    head: [
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
          content:
            'https://repository-images.githubusercontent.com/992105751/b7ca30bb-f4b8-4dcf-9331-f9f9c8d45e3e'
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
          content:
            'https://repository-images.githubusercontent.com/992105751/b7ca30bb-f4b8-4dcf-9331-f9f9c8d45e3e'
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
        pattern:
          'https://github.com/phun-ky/hybrid-compute/edit/main/docs/:path',
        text: 'Suggest changes to this page'
      },
      siteTitle: 'Hybrid Compute',
      logo: {
        src: '/logo/logo.svg',
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
              { text: 'Worker', link: '/guide/usage/worker' }
            ]
          },
          {
            text: 'Development',
            link: '/guide/development'
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
  })
);
