<template>
  <app-navigation />

  <slot />

  <app-footer />
</template>
<script setup lang="ts">
import AppNavigation from '~/components/navigation/appNavigation.vue'
import AppFooter from '~/components/footer/appFooter.vue'
</script>
