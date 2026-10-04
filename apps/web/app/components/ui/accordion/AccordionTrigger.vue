<script setup lang="ts">
import { ChevronDownIcon, ChevronUpIcon } from '@lucide/vue'
import { reactiveOmit } from '@vueuse/core'
import type { AccordionTriggerProps } from 'reka-ui'
import { AccordionHeader, AccordionTrigger } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

const props = defineProps<AccordionTriggerProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <AccordionHeader class="flex">
    <AccordionTrigger
      data-slot="accordion-trigger"
      v-bind="delegatedProps"
      :class="
        cn(
          'focus-visible:ring-ring/50 focus-visible:border-ring focus-visible:after:border-ring **:data-[slot=accordion-trigger-icon]:text-muted-foreground focus-visible:ring-3 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 group/accordion-trigger relative flex flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-left text-sm font-medium outline-none transition-all hover:underline disabled:pointer-events-none disabled:opacity-50',
          props.class
        )
      "
    >
      <slot />
      <slot name="icon">
        <ChevronDownIcon
          data-slot="accordion-trigger-icon"
          class="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
        />
        <ChevronUpIcon
          data-slot="accordion-trigger-icon"
          class="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
        />
      </slot>
    </AccordionTrigger>
  </AccordionHeader>
</template>
