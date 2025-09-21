<template>
  <app-navigation />

  <slot />

  <app-footer />
</template>
<script setup lang="ts">
import AppFooter from '~/components/footer/appFooter.vue'
import AppNavigation from '~/components/navigation/appNavigation.vue'
</script>
