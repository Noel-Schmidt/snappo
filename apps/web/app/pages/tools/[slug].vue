<template>
  <page-header :title="entry.title" :subtitle="entry.description" :badge="entry.badge" />
  <component :is="Comp" />
</template>

<script setup lang="ts">
import PageHeader from '~/components/core/pageHeader.vue'

const slug = String(useRoute().params.slug)

const appCfg = useAppConfig()
const tools = appCfg.tools

if (!tools.length) {
  console.log(tools)
  throw createError({ statusCode: 500, statusMessage: 'App-Config tools empty' })
}

const entry = tools.find((t: any) => t.slug === slug)
if (!entry) {
  throw createError({ statusCode: 404, statusMessage: 'Tool not found' })
}

useToolSeo(entry)

const views = import.meta.glob('~/components/tools/*.vue')
const path = Object.keys(views).find((p) => p.endsWith(`/tools/${entry.component}`))
if (!path) throw createError({ statusCode: 500, statusMessage: 'Tool not found' })
const Comp = defineAsyncComponent(views[path] as any)
</script>
