<template>
  <section class="bg-neutral-950 py-24 text-neutral-50">
    <div class="mx-auto max-w-6xl px-6">
      <div class="grid gap-12 lg:grid-cols-3">
        <div class="lg:col-span-1">
          <h2 class="text-4xl font-extrabold tracking-tight">Questions, answered</h2>
          <p class="mt-4 text-neutral-300">Privacy-first. No installs. Dark by default.</p>
        </div>

        <div class="lg:col-span-2">
          <Accordion
            type="single"
            collapsible
            class="divide-y divide-neutral-900 rounded-xl bg-neutral-950 ring-1 ring-neutral-800"
          >
            <AccordionItem
              v-for="q in faqs"
              :key="q.q"
              :value="q.q"
              class="transition-colors [&[data-state=open]]:bg-neutral-950/70"
            >
              <AccordionTrigger class="group w-full px-4 py-5 text-left focus-visible:outline-none">
                <div class="flex items-center gap-3">
                  <div
                    class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-neutral-900 ring-1 ring-neutral-800"
                  >
                    <ChevronDown
                      class="h-4 w-4 text-neutral-300 transition-transform duration-200 group-data-[state=open]:rotate-180"
                    />
                  </div>
                  <span class="text-base font-medium tracking-tight text-neutral-100">
                    {{ q.q }}
                  </span>
                </div>
              </AccordionTrigger>

              <AccordionContent class="px-4 pb-6">
                <div class="ml-11 space-y-3 text-neutral-300">
                  <p v-for="(p, i) in q.a" :key="i">{{ p }}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ChevronDown } from 'lucide-vue-next'

type QA = { q: string; a: string[] }

const faqs: QA[] = [
  {
    q: 'Is my data sent anywhere?',
    a: ['No. Tools run client-side. No accounts, no tracking, no telemetry.'],
  },
  {
    q: 'Do I need to install anything?',
    a: ['No. Open in the browser and use the tools immediately.'],
  },
  {
    q: 'How is security handled?',
    a: ['Sensitive operations use well-known libraries. Nothing leaves your device by default.'],
  },
  {
    q: 'Dark mode?',
    a: ['Yes. Dark-first UI across all components.'],
  },
  {
    q: 'Can I contribute?',
    a: ['Yes. Open an issue or PR. Keep changes focused and follow Conventional Commits.'],
  },
]
</script>
