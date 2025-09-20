<template>
  <page-header
      title="Contact Snappo"
      subtitle="Get in touch with Snappo. Reach out via email or connect on GitHub"
      badge="About"
  />

  <section class="bg-neutral-950 text-neutral-50 pt-24">
    <div class="mx-auto max-w-3xl px-6">
      <div class="rounded-xl border border-neutral-800 bg-neutral-900/40 p-8">
        <h2 class="text-2xl font-bold tracking-tight mb-6">Contact</h2>
        <div class="grid gap-6">
          <div class="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
            <div>
              <p class="text-sm text-neutral-400">Email</p>
              <p class="font-medium">hello@snappo.me</p>
            </div>
            <Button variant="outline" size="sm" @click="copyEmail">Copy</Button>
          </div>
          <div class="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
            <div>
              <p class="text-sm text-neutral-400">GitHub</p>
              <a
                  href="https://github.com/noel-schmidt/snappo"
                  target="_blank"
                  class="font-medium hover:underline"
              >
                https://github.com/noel-schmidt/snappo
              </a>
            </div>
            <Button variant="outline" size="sm" as-child>
              <a href="https://github.com/noel-schmidt/snappo" target="_blank">Open</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <ContributionSection />
</template>

<script setup lang="ts">
import PageHeader from "~/components/core/pageHeader.vue";
import { Button } from '@/components/ui/button'
import ContributionSection from "~/components/home/contributionSection.vue";

function copyEmail() {
  navigator.clipboard.writeText('hello@snappo.me').catch(() => {})
}

const title = 'Contact'
const site = 'Snappo'
const fullTitle = `${title} | ${site}`
const url = 'https://snappo.dev/contact'
const description =
    'Get in touch with Snappo. Reach out via email or connect on GitHub — contact us today.'

useSeoMeta({
  title: fullTitle,
  description,
  ogTitle: fullTitle,
  ogDescription: description,
  ogUrl: url,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

defineOgImageComponent('Pergel', {
  headline: 'About',
  title: title,
  description: description,
})
</script>