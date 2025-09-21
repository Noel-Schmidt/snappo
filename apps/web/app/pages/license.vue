<template>
  <page-header
    title="License"
    subtitle="Review Snappo’s licensing terms and conditions for using our developer tools"
    badge="About"
  />

  <section class="bg-neutral-950 py-24 text-neutral-50">
    <tool-layout>
      <div class="rounded-xl border border-neutral-800 bg-neutral-900/40 p-8">
        <h2 class="mb-6 text-2xl font-bold tracking-tight">License</h2>
        <div class="prose prose-invert max-w-none text-sm leading-relaxed">
          <pre class="whitespace-pre-wrap text-neutral-300">
MIT License

Copyright (c) 2025 Noel Schmidt

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre
          >
        </div>
      </div>
    </tool-layout>
  </section>
</template>

<script setup lang="ts">
import PageHeader from '~/components/core/pageHeader.vue'

const title = 'License – Terms and Conditions'
const fullTitle = title
const url = 'https://snappo.dev/license'
const description =
  'Read the Snappo license terms and conditions. Understand how you can use our free developer tools, their limitations, and distribution rights.'

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
  title: fullTitle,
  description: description,
})
</script>
