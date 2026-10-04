# Snappo

Snappo is an open-source collection of browser-based tools for development, text, security, color, and CSS tasks. Find a utility in the tool catalog, work with its focused controls, and copy the result into your project.

[![Nuxt](https://img.shields.io/badge/Nuxt-00DC82?style=flat-square&logo=nuxt&logoColor=white)](https://nuxt.com/)
[![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?style=flat-square&logo=turborepo&logoColor=white)](https://turbo.build/)

## What you can do

### Code and data

- **JSON Tool**: Format, validate, and minify JSON. Inspect syntax errors and copy the output.
- **Regex Tester**: Test a regular expression against sample text, inspect matches and capture groups, and refer to a syntax guide.
- **Diff Checker**: Compare two text inputs and review added, removed, or changed lines.
- **Minifier**: Remove whitespace and other unnecessary characters from JavaScript, CSS, or HTML.
- **Cron Tool**: Build or parse cron expressions, read a schedule in plain language, and preview upcoming run times.
- **UUID Tool**: Generate supported UUID versions individually or in batches.

### Text

- **Case Converter**: Convert text to camelCase, snake_case, PascalCase, kebab-case, and other naming styles.
- **Lorem Ipsum Generator**: Create placeholder text by word, sentence, or paragraph count, with optional HTML tags.

### Security

- **Password Generator**: Choose a password length and include letters, numbers, or symbols.
- **Bcrypt Generator**: Create bcrypt hashes, adjust the cost factor, and check a password against an existing hash.

### Color and CSS

- **Color Picker**: Pick a color and convert between HEX, RGB, and HSL values.
- **Palette Generator**: Start with a base color and explore related hues, shades, and tints.
- **Color Contrast Checker**: Check foreground and background contrast against WCAG AA and AAA criteria.
- **Border Radius Generator**: Adjust corner radii in a preview and copy the CSS declaration.
- **Box Shadow Generator**: Tune shadow layers and copy the resulting CSS value.

Browse the [tool collection](https://snappo.me/tools) to find a utility. The catalog includes search and categories.

## Getting started

### Requirements

- Node.js 22.18.0, as specified by the workspace
- pnpm 10.12.4, as specified by the root package manifest

### Run locally

```bash
git clone https://github.com/Noel-Schmidt/snappo.git
cd snappo
pnpm install
pnpm dev
```

The development command starts the workspace apps through Turborepo. To run a command for the web app only, change into `apps/web` and use its scripts.

### Workspace commands

Run these from the repository root:

| Command | Description |
| --- | --- |
| `pnpm dev` | Start development tasks across the workspace |
| `pnpm build` | Build workspace packages and apps |
| `pnpm lint` | Lint workspace packages and apps |
| `pnpm test` | Run workspace tests |
| `pnpm typecheck` | Run workspace type checks |

## Project structure

```text
apps/
  web/       Nuxt application
packages/    Shared workspace packages
```

The web app keeps its pages, components, and tool catalog under `apps/web/app`. The catalog defines each tool's name, description, tags, and component, and the dynamic route renders tools from that catalog.

## Built with

| Technology | Role |
| --- | --- |
| [![Nuxt](https://img.shields.io/badge/Nuxt-00DC82?style=flat-square&logo=nuxt&logoColor=white)](https://nuxt.com/) | Web framework |
| [![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org/) | Interface components |
| [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) | Application language |
| [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/) | Styling |
| [![pnpm](https://img.shields.io/badge/pnpm-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/) | Package management |
| [![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?style=flat-square&logo=turborepo&logoColor=white)](https://turbo.build/) | Workspace task runner |

## Contributing

Contributions are welcome. To propose a change:

1. Fork the repository and create a feature branch.
2. Install dependencies with `pnpm install`.
3. Make and commit your changes.
4. Run the relevant workspace checks.
5. Open a pull request with a clear description of the change.

Use the scripts listed above to run the workspace checks. Keep changes focused and follow the existing Vue, Nuxt, and TypeScript conventions.

## Security

If you find a security issue, contact [me@noel-schmidt.de](mailto:me@noel-schmidt.de).
