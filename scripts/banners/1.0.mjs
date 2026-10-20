// Content of the release banners for 1.0. Copy this file for the next major
// (e.g. 2.0.mjs) and run: npm run banners -- 2.0
export default {
  slug: 'v1',
  pill: 'Release 1.0 · October 2026',
  kicker: '// version 1.0',
  title: ['Run each task', { accent: 'where it fits' }],
  body: 'All four packages reach 1.0: one API for the main thread, Web Workers and remote services, with validation, cancellation and typed errors, and no breaking changes before 2.0.',
  panels: [
    {
      label: 'Packages · npm',
      status: 'Stable',
      rows: [
        { text: 'core · local', chip: '1.0.0' },
        { text: 'remote · worker', chip: '1.0.0' }
      ]
    },
    {
      label: 'runTask · auto',
      status: '3 lanes',
      lanes: [
        {
          name: 'main',
          slices: [
            { at: 0, width: 18 },
            { at: 70, width: 12, blocking: true }
          ]
        },
        { name: 'worker', slices: [{ at: 20, width: 46 }] },
        { name: 'remote', slices: [{ at: 50, width: 34 }] }
      ]
    }
  ]
};
