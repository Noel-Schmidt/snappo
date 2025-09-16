<template>
  <app-navigation />

  <slot />
</template>
<script setup lang="ts">
import AppNavigation from "~/components/navigation/appNavigation.vue";
</script>