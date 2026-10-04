<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import type { AccordionContentProps } from 'reka-ui'
import { AccordionContent } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

const props = defineProps<AccordionContentProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <AccordionContent
    data-slot="accordion-content"
    v-bind="delegatedProps"
    class="data-open:animate-accordion-down data-closed:animate-accordion-up overflow-hidden text-sm"
  >
    <div
      :class="
        cn(
          '[&_a]:underline-offset-3 [&_a]:hover:text-foreground pb-2.5 pt-0 [&_a]:underline [&_p:not(:last-child)]:mb-4',
          props.class
        )
      "
    >
      <slot />
    </div>
  </AccordionContent>
</template>
