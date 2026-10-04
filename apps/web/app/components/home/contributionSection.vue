<template>
  <section class="border-border bg-muted/40 text-foreground border-y py-16 sm:py-20">
    <div class="mx-auto max-w-7xl px-6">
      <div class="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <div>
          <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">
            Help make Snappo better
          </h2>
          <p class="text-muted-foreground mt-3 max-w-xl leading-7">
            Contributions can start with a clear bug report or a useful tool idea. If you want to
            work on the code, the guide covers setup, commits, checks, and pull requests.
          </p>

          <ul class="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <li
              v-for="path in contributionPaths"
              :key="path.title"
              class="border-border bg-card flex gap-3 rounded-lg border p-4"
            >
              <component
                :is="path.icon"
                class="mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-300"
                aria-hidden="true"
              />
              <div>
                <h3 class="text-sm font-medium">{{ path.title }}</h3>
                <p class="text-muted-foreground mt-1 text-sm leading-6">{{ path.description }}</p>
              </div>
            </li>
          </ul>

          <div class="mt-6 flex flex-wrap gap-3">
            <a
              :href="issuesUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex h-11 items-center rounded-md bg-teal-400 px-4 text-sm font-semibold text-neutral-950 transition-colors hover:bg-teal-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
            >
              Report an issue
            </a>
            <a
              :href="contribUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="border-input text-foreground hover:border-foreground/40 hover:bg-accent focus-visible:outline-ring inline-flex h-11 items-center rounded-md border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Read the contribution guide
            </a>
          </div>
        </div>

        <figure class="relative py-2 sm:px-2 sm:py-4">
          <figcaption class="max-w-md text-2xl font-semibold tracking-tight sm:text-3xl">
            How a code contribution moves forward
          </figcaption>
          <ol
            class="before:bg-border relative mt-8 space-y-6 before:absolute before:bottom-10 before:left-6 before:top-10 before:w-px"
          >
            <li v-for="(step, index) in workflow" :key="step.title" class="relative flex gap-5">
              <span
                class="border-border bg-background text-muted-foreground relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-xl border"
                aria-hidden="true"
              >
                <component :is="step.icon" class="h-5 w-5" />
              </span>
              <div class="min-w-0 flex-1 py-2">
                <div class="flex items-baseline gap-2">
                  <span class="text-muted-foreground font-mono text-sm">0{{ index + 1 }}</span>
                  <h3 class="text-lg font-medium">{{ step.title }}</h3>
                </div>
                <p class="text-muted-foreground mt-2 max-w-md text-base leading-7">
                  {{ step.description }}
                </p>
              </div>
            </li>
          </ol>
        </figure>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Bug, GitBranch, GitPullRequest, Lightbulb, MessageSquareText } from 'lucide-vue-next'

const issuesUrl = 'https://github.com/noel-schmidt/snappo/issues'
const contribUrl = 'https://github.com/noel-schmidt/snappo/blob/main/CONTRIBUTING.md'

const contributionPaths = [
  {
    title: 'Report a bug',
    description: 'Share steps to reproduce it, what you expected, and what happened.',
    icon: Bug,
  },
  {
    title: 'Suggest a tool',
    description: 'Describe the task it should solve and who would find it useful.',
    icon: Lightbulb,
  },
  {
    title: 'Improve the project',
    description: 'Fix code, refine the interface, or improve the documentation.',
    icon: MessageSquareText,
  },
]

const workflow = [
  {
    title: 'Open an issue',
    description: 'Explain the problem or proposal before starting a larger change.',
    icon: MessageSquareText,
  },
  {
    title: 'Make a focused change',
    description: 'Fork the repository, create a branch, and keep the scope clear.',
    icon: GitBranch,
  },
  {
    title: 'Open a pull request',
    description: 'Summarize the change and include screenshots for interface updates.',
    icon: GitPullRequest,
  },
]
</script>
