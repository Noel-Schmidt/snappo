<template>
  <section class="bg-background text-foreground py-20 sm:py-28">
    <div class="mx-auto max-w-7xl px-6">
      <div class="mb-8 max-w-2xl">
        <h2 class="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
          Questions about Snappo
        </h2>
        <p class="text-muted-foreground mt-3 leading-7">
          Input privacy, using the tools, and contributing to the project.
        </p>
      </div>

      <Accordion type="single" collapsible class="grid gap-3">
        <AccordionItem
          v-for="item in faqs"
          :key="item.q"
          :value="item.q"
          class="border-border bg-card data-[state=open]:bg-muted/50 rounded-xl border px-4 transition-colors sm:px-5"
        >
          <AccordionTrigger
            class="text-foreground focus-visible:outline-ring group flex w-full items-center justify-between gap-5 py-5 text-left text-base font-medium hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span>{{ item.q }}</span>
          </AccordionTrigger>
          <AccordionContent class="text-muted-foreground pb-5 pr-8 text-sm leading-7">
            <p v-for="(paragraph, index) in item.a" :key="index">{{ paragraph }}</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <NuxtLink
        to="/faq"
        class="text-foreground focus-visible:outline-ring mt-6 inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Read the full Snappo FAQ
      </NuxtLink>
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

type QA = { q: string; a: string[] }
const faqs: QA[] = [
  {
    q: 'Where does my input go?',
    a: [
      'Most tools process input in your browser. Check the individual tool before entering sensitive data.',
    ],
  },
  {
    q: 'Do I need an account or an install?',
    a: ['No account or installation is needed. Open a tool and use it.'],
  },
  {
    q: 'Which tools are available?',
    a: [
      'Snappo includes a JSON formatter, regex tester, cron expression builder, password and bcrypt generators, and a color picker. More utilities are listed on the tools page.',
    ],
  },
  {
    q: 'How can I format or validate JSON online?',
    a: [
      'Open the JSON tool, paste your data, and choose whether to format, validate, or minify it. The tool page includes the available options.',
    ],
  },
  {
    q: 'Can I generate a password with Snappo?',
    a: [
      'Yes. The password generator lets you choose a length and character sets, then generates a password in the tool.',
    ],
  },
  {
    q: 'How can I contribute?',
    a: [
      'Open an issue to report a bug or suggest a tool. GitHub has the source code and contribution guide.',
    ],
  },
]
</script>
