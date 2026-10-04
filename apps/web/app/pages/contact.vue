<template>
  <main class="bg-background text-foreground">
    <page-header
      title="Contact Snappo"
      subtitle="For questions, feedback, or tool ideas, choose the route that fits your message."
    >
      <template #heading>
        Have a question?<br /><span class="text-teal-700 dark:text-teal-300">Write to Snappo.</span>
      </template>
    </page-header>

    <section class="border-y border-neutral-800 bg-neutral-950 py-16 text-neutral-50 sm:py-20">
      <div class="mx-auto max-w-7xl px-6">
        <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Choose a contact route</h2>
        <div class="mt-7 grid gap-4 md:grid-cols-2">
          <a
            href="mailto:hello@snappo.me"
            class="rounded-xl border border-neutral-800 bg-neutral-900 p-6 transition-colors hover:border-neutral-700 hover:bg-neutral-900/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300 sm:p-8"
          >
            <Mail class="h-5 w-5 text-teal-300" aria-hidden="true" />
            <h3 class="mt-5 text-lg font-semibold">Email</h3>
            <p class="mt-2 text-sm leading-6 text-neutral-400">
              For general questions and feedback.
            </p>
            <span
              class="mt-5 inline-block font-medium text-teal-300 underline decoration-teal-500 underline-offset-4"
            >
              hello@snappo.me
            </span>
          </a>

          <a
            href="https://github.com/noel-schmidt/snappo/issues"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-xl border border-neutral-800 bg-neutral-900 p-6 transition-colors hover:border-neutral-700 hover:bg-neutral-900/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300 sm:p-8"
          >
            <Github class="h-5 w-5 text-teal-300" aria-hidden="true" />
            <h3 class="mt-5 text-lg font-semibold">GitHub issues</h3>
            <p class="mt-2 text-sm leading-6 text-neutral-400">
              Report a bug, suggest a tool, or discuss a change to the project.
            </p>
            <span
              class="mt-5 inline-block font-medium text-teal-300 underline decoration-teal-500 underline-offset-4"
            >
              Visit the issue tracker
            </span>
          </a>
        </div>
        <p class="mt-6 text-sm leading-6 text-neutral-400">
          For security vulnerabilities, please email us directly instead of posting a public issue.
        </p>
      </div>
    </section>

    <home-contribution-section />
  </main>
</template>

<script setup lang="ts">
import { Github, Mail } from 'lucide-vue-next'

import PageHeader from '~/components/core/pageHeader.vue'

const title = 'Contact Snappo | Developer Tools'
const description =
  'Contact the Snappo developer tools project by email or GitHub to share feedback, report a bug, or suggest a tool.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: 'https://snappo.me/contact',
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

defineOgImage('Pergel', {
  headline: 'Contact Snappo',
  title: 'Questions, feedback, or tool ideas',
  description,
})
</script>
