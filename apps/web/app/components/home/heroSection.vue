<template>
  <section
    class="hero border-border bg-background text-foreground relative isolate overflow-hidden border-b"
  >
    <div
      class="hero-atmosphere pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div class="hero-light" />
    </div>
    <div class="hero-grid pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="hero-grid-inner mx-auto grid h-full max-w-6xl grid-cols-12">
        <div v-for="column in 12" :key="column" class="border-border/40 border-l last:border-r" />
      </div>
    </div>

    <div
      class="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 sm:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-32"
    >
      <div>
        <h1
          class="max-w-2xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-7xl"
        >
          Tidy JSON.<br />Check a color.<br /><span class="text-teal-700 dark:text-teal-300"
            >Move on.</span
          >
        </h1>
        <p class="text-muted-foreground mt-7 max-w-xl text-lg leading-8">
          Format JSON, test regex, generate passwords, and work with color in one place.
        </p>
        <div class="mt-9 flex flex-wrap items-center gap-3">
          <NuxtLink
            to="/tools"
            class="inline-flex h-12 items-center rounded-md bg-teal-400 px-5 font-semibold text-neutral-950 transition-colors hover:bg-teal-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
          >
            Browse all tools
          </NuxtLink>
          <a
            :href="githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="border-input text-foreground hover:border-foreground/40 hover:bg-accent focus-visible:outline-ring inline-flex h-12 items-center rounded-md border px-5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Source code
          </a>
        </div>
      </div>

      <div class="relative mx-auto w-full max-w-xl">
        <div
          class="mascot-wrap pointer-events-none absolute -top-12 right-5 z-10 sm:-top-16 sm:right-8"
        >
          <img
            src="/images/snappo.svg"
            alt="Snappo crocodile"
            class="mascot h-20 w-20 object-contain sm:h-28 sm:w-28"
          />
        </div>

        <div
          class="border-border bg-card overflow-hidden rounded-2xl border shadow-xl shadow-black/10"
        >
          <div class="bg-border grid gap-px sm:grid-cols-2">
            <NuxtLink
              v-for="(tool, index) in quickTools"
              :key="tool.name"
              :to="tool.href"
              class="quick-tool bg-card hover:bg-accent focus-visible:outline-ring group relative flex min-h-32 items-end overflow-hidden p-5 transition-colors focus-visible:z-10 focus-visible:outline-2"
              :style="{ '--tool-delay': `${index * 70}ms` }"
            >
              <span
                class="border-border bg-muted text-primary absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg border transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110"
              >
                <component :is="tool.icon" class="h-4 w-4" aria-hidden="true" />
              </span>
              <span>
                <span class="text-card-foreground block text-sm font-medium">{{ tool.name }}</span>
                <span class="text-muted-foreground mt-1 block text-xs">{{ tool.detail }}</span>
              </span>
            </NuxtLink>
          </div>
          <NuxtLink
            to="/tools"
            class="bg-muted text-muted-foreground hover:text-primary flex items-center justify-between px-5 py-4 text-sm transition-colors"
          >
            <span>All tools</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Braces, FileText, Hash, Palette, Regex, ShieldCheck } from 'lucide-vue-next'

const githubUrl = 'https://github.com/noel-schmidt/snappo'

const quickTools = [
  { name: 'JSON tool', detail: 'Format and validate', icon: Braces, href: '/tools/json-tool' },
  {
    name: 'Color picker',
    detail: 'Pick and convert colors',
    icon: Palette,
    href: '/tools/color-picker',
  },
  {
    name: 'Regex tester',
    detail: 'Test patterns as you type',
    icon: Regex,
    href: '/tools/regex-tester',
  },
  {
    name: 'Password generator',
    detail: 'Set length and character sets',
    icon: ShieldCheck,
    href: '/tools/password-generator',
  },
  {
    name: 'Bcrypt generator',
    detail: 'Create and verify hashes',
    icon: Hash,
    href: '/tools/bcrypt-generator',
  },
  {
    name: 'Lorem ipsum',
    detail: 'Generate placeholder copy',
    icon: FileText,
    href: '/tools/lorem-ipsum-generator',
  },
]
</script>

<style scoped>
.hero-light {
  position: absolute;
  top: -24rem;
  right: -12rem;
  width: min(78vw, 72rem);
  height: min(64vw, 52rem);
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgb(45 212 191 / 0.07), transparent 68%);
  filter: blur(24px);
}

.hero-grid {
  mask-image: linear-gradient(to bottom, black 0%, rgb(0 0 0 / 0.65) 58%, transparent 100%);
  opacity: 0.7;
}

.mascot {
  animation: mascot-bob 3.8s ease-in-out infinite;
  filter: drop-shadow(0 10px 24px rgb(0 0 0 / 0.28));
}

.quick-tool {
  animation: tool-arrive 450ms both;
  animation-delay: var(--tool-delay);
}

@keyframes mascot-bob {
  0%,
  100% {
    transform: translateY(0) rotate(-4deg);
  }
  50% {
    transform: translateY(-7px) rotate(3deg);
  }
}

@keyframes tool-arrive {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mascot,
  .quick-tool {
    animation: none;
  }
}
</style>
