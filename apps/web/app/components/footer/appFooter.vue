<template>
  <footer class="border-border bg-background text-foreground border-t">
    <div
      class="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-7 sm:flex-row sm:justify-between"
    >
      <NuxtLink
        to="/"
        class="flex items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300"
      >
        <img src="/images/snappo.svg" class="w-8" alt="" />
        <span class="text-foreground text-sm font-semibold tracking-tight">Snappo</span>
      </NuxtLink>

      <nav aria-label="Footer" class="flex flex-wrap justify-center gap-x-7 gap-y-3 text-sm">
        <NuxtLink
          to="/tools"
          class="transition-colors hover:text-teal-300 focus-visible:text-teal-300"
        >
          Tools
        </NuxtLink>
        <NuxtLink
          to="/about"
          class="transition-colors hover:text-teal-300 focus-visible:text-teal-300"
        >
          About
        </NuxtLink>
        <NuxtLink
          to="/faq"
          class="transition-colors hover:text-teal-300 focus-visible:text-teal-300"
        >
          FAQ
        </NuxtLink>
        <NuxtLink
          to="/blog"
          class="transition-colors hover:text-teal-300 focus-visible:text-teal-300"
        >
          Blog
        </NuxtLink>
        <a
          href="https://github.com/noel-schmidt/snappo"
          target="_blank"
          rel="noopener noreferrer"
          class="transition-colors hover:text-teal-300 focus-visible:text-teal-300"
        >
          GitHub
        </a>
      </nav>

      <div class="flex items-center gap-3">
        <button
          v-if="!colorMode.unknown"
          type="button"
          class="border-input bg-card text-foreground hover:border-foreground/40 hover:text-primary focus-visible:outline-ring inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
          :aria-pressed="!isDark"
          @click="toggleTheme"
        >
          <Sun v-if="isDark" class="h-3.5 w-3.5" aria-hidden="true" />
          <Moon v-else class="h-3.5 w-3.5" aria-hidden="true" />
          <span>{{ isDark ? 'Light' : 'Dark' }}</span>
        </button>
        <p class="text-muted-foreground text-xs">&copy; {{ new Date().getFullYear() }} Snappo</p>
      </div>
    </div>

    <div class="activity-field px-3 pb-7 sm:px-5" @pointerleave="activeIndex = -1">
      <div class="activity-grid" aria-hidden="true">
        <div v-for="(week, weekIndex) in weeks" :key="weekIndex" class="activity-week">
          <span
            v-for="(level, dayIndex) in week"
            :key="dayIndex"
            class="activity-cell"
            :class="[
              `activity-cell--${level}`,
              { 'activity-cell--active': activeIndex === weekIndex * 7 + dayIndex },
              { 'activity-cell--near': isNear(weekIndex, dayIndex) },
            ]"
            :style="{ '--wave-delay': `${waveDelay(weekIndex, dayIndex)}ms` }"
            @pointerenter="activeIndex = weekIndex * 7 + dayIndex"
          />
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'
import { computed, ref } from 'vue'

const activeIndex = ref(-1)
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

function toggleTheme() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

const weeks = Array.from({ length: 52 }, (_, weekIndex) =>
  Array.from({ length: 7 }, (_, dayIndex) => {
    const value = Math.abs(Math.sin((weekIndex * 7 + dayIndex + 1) * 78.233) * 43758.5453) % 1
    if (value > 0.94) return 4
    if (value > 0.82) return 3
    if (value > 0.64) return 2
    if (value > 0.4) return 1
    return 0
  })
)

function isNear(weekIndex: number, dayIndex: number) {
  if (activeIndex.value < 0) return false
  const activeWeek = Math.floor(activeIndex.value / 7)
  const activeDay = activeIndex.value % 7
  const distance = Math.abs(activeWeek - weekIndex) + Math.abs(activeDay - dayIndex)
  return distance > 0 && distance <= 4
}

function waveDelay(weekIndex: number, dayIndex: number) {
  if (activeIndex.value < 0) return 0
  const activeWeek = Math.floor(activeIndex.value / 7)
  const activeDay = activeIndex.value % 7
  return (Math.abs(activeWeek - weekIndex) + Math.abs(activeDay - dayIndex)) * 24
}
</script>

<style scoped>
.activity-field {
  width: 100%;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(52, minmax(0, 1fr));
  gap: clamp(2px, 0.45vw, 6px);
  width: 100%;
}

.activity-week {
  display: grid;
  grid-template-rows: repeat(7, minmax(0, 1fr));
  gap: clamp(2px, 0.45vw, 6px);
  min-width: 0;
}

.activity-cell {
  aspect-ratio: 1;
  border-radius: 2px;
  cursor: pointer;
  transition:
    background-color 180ms ease,
    filter 180ms ease,
    transform 180ms ease;
}

.activity-cell--0 {
  background: #171d1a;
}
.activity-cell--1 {
  background: #123a27;
}
.activity-cell--2 {
  background: #17643a;
}
.activity-cell--3 {
  background: #229451;
}
.activity-cell--4 {
  background: #4cc477;
}

.activity-cell--active {
  position: relative;
  z-index: 1;
  background: #a3efbd;
  filter: brightness(1.08);
  transform: scale(1.32);
}

.activity-cell--near {
  filter: brightness(1.5);
  transform: scale(1.08);
  transition-delay: var(--wave-delay);
  animation: activity-wave 420ms ease-out both;
  animation-delay: var(--wave-delay);
}

@keyframes activity-wave {
  0% {
    filter: brightness(1);
    transform: scale(1);
  }
  45% {
    filter: brightness(1.9);
    transform: scale(1.22);
  }
  100% {
    filter: brightness(1.5);
    transform: scale(1.08);
  }
}

@media (max-width: 640px) {
  .activity-grid {
    grid-template-columns: repeat(26, minmax(0, 1fr));
  }

  .activity-week:nth-child(even) {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .activity-cell {
    transition: none;
    animation: none;
  }
}
</style>
