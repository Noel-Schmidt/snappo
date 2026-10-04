# Snappo repository guide

## Project structure

- This is a pnpm workspace managed with Turbo. The Nuxt application lives in `apps/web`; shared packages live in `packages/`.
- Nuxt application code is under `apps/web/app`. Reusable UI primitives are in `app/components/ui`, tool page components are in `app/components/tools`, and the dynamic tool route is `app/pages/tools/[slug].vue`.
- Tool metadata and routing are catalog driven. When adding or renaming a tool, inspect and update the existing catalog/registry flow rather than adding a one-off route.
- Follow the existing Vue 3 `<script setup lang="ts">` and Nuxt conventions. Prefer the aliases already configured by the app (`@/` and `~/`).

## Tool page design

- Every tool must render inside `ToolLayout` from `~/components/tool/toolLayout.vue`. It supplies the shared page background, vertical spacing, and centered content width.
- Build the tool around its main task. Use a clear title, a short explanation, and logical input and result areas. Keep related controls together and make the primary action easy to identify.
- Use the shared components in `@/components/ui` for buttons, inputs, labels, sliders, switches, and textareas. Match existing border, card, muted, and foreground tokens (`border-border`, `bg-card`, `bg-muted`, `text-muted-foreground`) so light and dark themes remain consistent.
- Use responsive Tailwind layouts. Stack controls on narrow screens and introduce columns only when the content benefits from them. Keep spacing and control heights consistent with neighboring tools.
- Label every input. Provide useful placeholders, disabled states, and readable output. Give icon-only controls an accessible name; use status text and `aria-live` for results that change after an action.
- Explain specialized terms, constraints, or results with `ToolExplanation` when the tool benefits from supporting context. Keep explanatory copy concise and specific to the tool.
- Tool processing should happen in the browser when practical. Do not transmit user-provided values unless the feature explicitly requires a server and clearly communicates that behavior.

## Code and behavior

- Use TypeScript and preserve explicit value types. Vue template attributes written as static strings may arrive as strings; convert numeric values before passing them to components that require numbers. Prefer fixing type handling in shared wrappers when that resolves the issue consistently.
- Keep state local to the tool unless it is shared application state. Derive display values with `computed`; avoid duplicating values that can be derived.
- Handle empty, invalid, loading, success, and failure states where relevant. Guard actions that cannot run with the current inputs, and make clear feedback available after each action.
- Use existing dependencies and utilities before introducing new packages. Keep changes focused and avoid unrelated formatting or refactors.
- Follow the repository's Prettier and ESLint configuration. Use the package manager and scripts defined by the workspace; do not introduce npm lockfiles into this pnpm repository.
- Keep comments for non-obvious behavior or important constraints. Do not add comments that merely narrate straightforward code.

## Changes and checks

- Update the tool catalog, labels, descriptions, or metadata when a tool's public identity or behavior changes.
- Add or update meaningful tests for behavior changes when a suitable test location exists. Avoid tests that only mirror implementation details.
- Run the relevant checks for the changed workspace package. The web app defines `lint`, `test`, and `build` scripts; the root workspace also provides Turbo commands such as `pnpm typecheck`.
- Keep commits focused and use the Conventional Commit prefixes documented in `CONTRIBUTING.md` (`feat:`, `fix:`, `docs:`, `chore:`, or `refactor:`).

## Snappo visual and copy rules

- Treat the existing Snappo interface and the user's feedback as the design direction. Keep page titles, accent colors, spacing, and component behavior consistent with the established site instead of inventing a second visual system for one page.
- Keep each tool's outer content width at `max-w-7xl`; do not replace it with a narrower or wider page wrapper. A prose block such as `ToolExplanation` may use a narrower text measure inside that shared width for readability.
- Use the shared page heading supplied by the route. Do not add another hero, eyebrow badge, or duplicate H1 inside a tool component. Give a tool a local heading only when it labels a real section or action.
- Keep tool controls as the visual focus. Avoid card-in-card layouts, decorative card headers, badge clutter, and repeated icons. Add an icon only when it makes an action or state clearer; text labels are usually enough.
- Avoid gradient text, decorative glows, and motion without a clear product purpose. The homepage's user-requested background effect is specific to that area and is not a default for tool pages.
- Use semantic theme tokens and preserve light and dark mode. Do not hard-code a theme by styling a tool only for dark mode.
- Keep copy direct and specific. Remove generic slogans, filler, invented claims, repeated instructions, and AI-sounding section labels. Do not add text merely to make a page appear more complete.
- Put useful tool context after the interactive tool, not in a second hero or an extra card. Use `ToolExplanation` for concise, accurate definitions, behavior, limits, and real use cases. Write for both users and search engines without keyword stuffing or fabricated claims.
- Keep the FAQ interactive when a page uses an FAQ. Use one clear disclosure indicator, avoid redundant icons and decorative separators, and make the title part of the section's visual hierarchy.

## Repository-specific constraints

- Do not edit `apps/web/app/assets/css/tailwind.css` unless the user explicitly requests a change to that file. Prefer Shadcn Vue components, Tailwind utilities, and existing theme tokens.
- Do not run `nuxt build` or `nuxt generate` unless the user explicitly requests it. The user has reported that Nuxt commands can disrupt their development server; do not start, stop, or restart that server.
- For shared UI wrappers, account for Vue static template attributes arriving as strings. Normalize numeric props before passing them to native controls or component libraries, and emit the expected numeric value type back to `v-model`.
- Preserve the current tool behavior when improving its UI. Keep input and output flows, validation, loading states, and browser-local processing intact unless the user asks to change them.
- Before finishing, format changed Vue and TypeScript files with the repository's Prettier, run `git diff --check`, and run focused checks that do not trigger a Nuxt build or interrupt the development server.

## Existing page-specific direction

- Use `PageHeader` for tool catalog and other subpages so their title layouts stay consistent. Use the established teal accent, keep the headline readable across a few deliberate lines, and do not add a generic badge or extra page-level animation.
- Keep the homepage tool catalog after the hero. Tool entries should read as clear, usable boxes. Preserve the established blue icon hover treatment and the icon rotation interaction shared with the hero when editing those cards.
- The homepage hero uses its line grid and a subtle, ambient background glow centered behind the content. The glow belongs in the background; it must not follow the pointer. Keep this homepage treatment out of tool pages and static subpage headers.
- Keep the FAQ as a vertical, working accordion. Use a single clear disclosure indicator; do not pair a plus icon with an existing chevron or add decorative divider lines.
- Keep the contribution section's established dark surface and give its content enough room to read. Do not nest a decorative card inside another card.
- The footer includes a light/dark mode control and a large activity grid beneath the footer content. The grid uses the familiar contribution-calendar pattern and responds to hover without unrelated slogans or labels.
- Use Nuxt Color Mode for theme selection and make page components work in both themes. Do not implement a separate, conflicting theme switch or hard-code dark-only surfaces.
