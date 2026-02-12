import { defineConfig } from 'vitepress';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Auto-generate sidebar items from a directory of markdown files.
 * Reads .md files, extracts the first H1 as the label, and sorts alphabetically.
 * README.md files become the index page for that section.
 */
function generateSidebar(dir: string, basePath: string): { text: string; link: string }[] {
  const docsRoot = path.resolve(__dirname, '..');
  const fullDir = path.join(docsRoot, dir);

  if (!fs.existsSync(fullDir)) return [];

  return fs
    .readdirSync(fullDir)
    .filter((f) => f.endsWith('.md') && f !== 'README.md')
    .map((f) => {
      const content = fs.readFileSync(path.join(fullDir, f), 'utf-8');
      const match = content.match(/^#\s+(.+)$/m);
      const text = match ? match[1] : f.replace('.md', '');
      const link = `${basePath}/${f.replace('.md', '')}`;
      return { text, link };
    })
    .sort((a, b) => a.text.localeCompare(b.text));
}

export default defineConfig({
  title: 'protoLabs',
  description: 'AI-Native Development Agency',

  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }]],

  // Ignore archived docs — they clutter nav but stay accessible via direct URL
  srcExclude: ['archived/**'],

  // Allow dead links for cross-references to files outside docs/ (CLAUDE.md, CONTRIBUTING, etc.)
  ignoreDeadLinks: true,

  themeConfig: {
    logo: '/logo.svg',

    search: {
      provider: 'local',
    },

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Agents', link: '/agents/' },
      { text: 'Infrastructure', link: '/infra/' },
      { text: 'ProtoLabs', link: '/protolabs/' },
      {
        text: 'More',
        items: [
          { text: 'Server', link: '/server/route-organization' },
          { text: 'Authority', link: '/authority/org-chart' },
          { text: 'Development', link: '/dev/ui-architecture' },
        ],
      },
    ],

    sidebar: {
      '/agents/': [
        {
          text: 'Agent System',
          items: generateSidebar('agents', '/agents'),
        },
      ],
      '/infra/': [
        {
          text: 'Infrastructure',
          items: generateSidebar('infra', '/infra'),
        },
      ],
      '/server/': [
        {
          text: 'Server',
          items: generateSidebar('server', '/server'),
        },
      ],
      '/authority/': [
        {
          text: 'Authority System',
          items: [
            ...generateSidebar('authority', '/authority'),
            {
              text: 'Roles',
              items: generateSidebar('authority/roles', '/authority/roles'),
            },
          ],
        },
      ],
      '/dev/': [
        {
          text: 'Development',
          items: generateSidebar('dev', '/dev'),
        },
      ],
      '/protolabs/': [
        {
          text: 'ProtoLabs',
          items: generateSidebar('protolabs', '/protolabs'),
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/proto-labs-ai/automaker' }],

    editLink: {
      pattern: 'https://github.com/proto-labs-ai/automaker/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message:
        'Powered by <a href="https://github.com/proto-labs-ai/automaker">Automaker</a> — Built with VitePress',
      copyright: 'protoLabs AI',
    },
  },
});
