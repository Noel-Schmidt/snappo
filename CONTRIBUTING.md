# Contributing to Snappo

Thank you for your interest in contributing!  
This document explains the process and guidelines for contributing to this repository.

---

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/snappo.git
   cd snappo
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Run development server**:
   ```bash
   pnpm run dev
   ```

---

## Branching and Commits

- Create a new branch for each feature or fix:
  ```bash
  git checkout -b feat/feature-name
  git checkout -b fix/bug-name
  ```
- Keep commits small and descriptive.
- Use [Conventional Commits](https://www.conventionalcommits.org/) format:
  - `feat:` new feature
  - `fix:` bug fix
  - `docs:` documentation only
  - `chore:` build or tooling changes
  - `refactor:` code change without new feature or fix

Example:
```
feat(color-picker): add HSL to HEX conversion
```

---

## Code Style

- Follow the existing code formatting rules (Prettier + ESLint).
- Run checks before pushing:
  ```bash
  npm run lint
  npm run typecheck
  ```

---

## Testing

- Add or update tests for new functionality.
- Run tests locally:
  ```bash
  npm run test
  ```

---

## Pull Requests

1. Push your branch to your fork.
2. Open a Pull Request (PR) against the `main` branch of this repository.
3. Ensure the PR description clearly explains:
   - The problem it solves.
   - Changes introduced.
   - Screenshots or demos if relevant.

---

## Reporting Issues

- Use the GitHub [Issues](../../issues) page.
- Provide:
  - Clear steps to reproduce.
  - Expected vs. actual behavior.
  - Environment (browser, OS, Node version).

---

## Questions

If you are unsure about something, open a draft PR or discussion.  
We prefer collaboration over perfection.

---
