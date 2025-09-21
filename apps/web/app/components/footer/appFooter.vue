<template>
  <footer class="bg-neutral-950 text-neutral-300">
    <div class="h-px w-full bg-gradient-to-r from-transparent via-neutral-800 to-transparent"></div>
    <div class="mx-auto max-w-6xl px-6">
      <div class="grid grid-cols-1 items-center gap-6 py-8 md:grid-cols-3">
        <div class="flex justify-center md:justify-start">
          <div class="flex items-center gap-3">
            <img src="/images/snappo.svg" class="w-8" alt="Snappo" />
            <span class="text-sm font-semibold tracking-tight text-neutral-100">Snappo</span>
          </div>
        </div>

        <nav class="flex justify-center gap-8 text-sm">
          <NuxtLink to="/tools" class="transition-colors hover:text-neutral-100">Tools</NuxtLink>
          <NuxtLink to="/about" class="transition-colors hover:text-neutral-100">About</NuxtLink>
          <a
            href="https://github.com/noel-schmidt/snappo"
            target="_blank"
            rel="noopener"
            class="transition-colors hover:text-neutral-100"
            >GitHub</a
          >
          <NuxtLink to="/license" class="transition-colors hover:text-neutral-100"
            >License</NuxtLink
          >
        </nav>

        <div class="flex justify-center md:justify-end">
          <p class="text-xs text-neutral-500"
            >&copy; {{ new Date().getFullYear() }} Snappo. All rights reserved.</p
          >
        </div>
      </div>
    </div>
  </footer>
</template>
