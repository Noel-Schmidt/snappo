export default defineAppConfig({
  siteName: 'Snappo',
  siteBaseUrl: 'https://snappo.me',
  defaultOgComponent: 'Pergel',

  tools: [
    {
      slug: 'bcrypt-generator',
      title: 'Bcrypt Generator',
      subtitle:
        'Generate and verify secure bcrypt hashes with adjustable salt rounds. Test different strengths and understand the impact on speed and security.',
      badge: 'Hashing',
      description:
        'Generate secure bcrypt hashes with Snappo. Adjust salt rounds, test performance, and learn hashing — try it now for free.',
      component: 'bcryptTool.vue',
      tags: ['security', 'hash', 'bcrypt'],
      status: 'beta',
      accent: 'rgba(16, 185, 129, 0.25)',
    },

    {
      slug: 'case-converter',
      title: 'Case Converter',
      badge: 'Text',
      description:
        'Convert text between camelCase, snake_case, PascalCase, kebab-case, and more. Copy results instantly and speed up your workflow — try it now with Snappo.',
      component: 'caseConverterTool.vue',
      tags: ['text', 'converter', 'case'],
      status: 'beta',
      accent: 'rgba(139,92,246,0.35)',
    },

    {
      slug: 'color-picker',
      title: 'Color Picker',
      badge: 'Design',
      description:
        'Pick, convert, and copy colors in HEX, RGB, HSL, and more. Build palettes, check contrast, and export tokens — try it now with Snappo.',
      component: 'colorPickerTool.vue',
      tags: ['color', 'picker', 'design'],
      status: 'beta',
      accent: 'rgba(99,102,241,0.35)',
    },
    {
      slug: 'lorem-ipsum-generator',
      title: 'Lorem Ipsum Generator',
      badge: 'Text',
      description:
        'Generate placeholder text by words, sentences, or paragraphs. Add HTML tags, set lengths, and copy instantly — try it now with Snappo.',
      component: 'loremIpsumTool.vue',
      tags: ['text', 'lorem', 'ipsum', 'generator'],
      status: 'beta',
      accent: 'rgba(244,114,182,0.35)',
    },
    {
      slug: 'regex-tester',
      title: 'Regex Tester',
      badge: 'Code',
      description:
        'Test and debug regular expressions with real-time highlighting, match groups, and quick reference — try it now with Snappo.',
      component: 'regexTesterTool.vue',
      tags: ['regex', 'regexp', 'test', 'debug'],
      status: 'beta',
      accent: 'rgba(34,197,94,0.35)',
    },

    {
      slug: 'diff-checker',
      title: 'Diff Checker',
      badge: 'Code',
      description:
        'Compare two texts side by side and highlight differences instantly. Detect changes, edits, and duplicates — try it now with Snappo.',
      component: 'diffCheckerTool.vue',
      tags: ['diff', 'compare', 'text', 'code'],
      status: 'beta',
      accent: 'rgba(59,130,246,0.35)',
    },

    {
      slug: 'palette-generator',
      title: 'Palette Generator',
      badge: 'Design',
      description:
        'Generate color palettes from a base color. Explore harmonies, shades, tints, and export palettes for your projects — try it now with Snappo.',
      component: 'paletteGeneratorTool.vue',
      tags: ['palette', 'colors', 'design', 'generator'],
      status: 'beta',
      accent: 'rgba(236,72,153,0.35)',
    },

    {
      slug: 'minifier',
      title: 'Minifier',
      badge: 'Code',
      description:
        'Minify JavaScript, CSS, or HTML to reduce file size and improve load times. Copy optimized code instantly — try it now with Snappo.',
      component: 'minifierTool.vue',
      tags: ['minify', 'javascript', 'css', 'html', 'optimize'],
      status: 'beta',
      accent: 'rgba(250,204,21,0.35)',
    },
  ],
})
