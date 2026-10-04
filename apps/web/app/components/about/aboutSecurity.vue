<template>
  <section class="bg-background text-foreground py-20 sm:py-28">
    <div class="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-[0.9fr_1.1fr] md:gap-20">
      <div class="max-w-xl">
        <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">
          Privacy depends on the tool
        </h2>
        <p class="text-muted-foreground mt-5 leading-7">
          Many Snappo tools process input in your browser, but behavior can vary by feature. Check
          the individual tool page before entering sensitive information.
        </p>
        <NuxtLink
          to="/tools"
          class="text-foreground mt-6 inline-flex text-sm font-medium underline decoration-teal-500 underline-offset-4 transition-colors hover:text-teal-700 dark:hover:text-teal-300"
        >
          Review the tools
        </NuxtLink>
      </div>

      <div class="border-border border-t pt-6 md:border-t-0 md:pt-0">
        <h3 class="text-xl font-semibold tracking-tight">Reporting a security issue</h3>
        <p class="text-muted-foreground mt-3 max-w-xl leading-7">
          Please report vulnerabilities privately instead of opening a public issue. Email
          <a
            href="mailto:hello@snappo.me"
            class="text-foreground underline decoration-teal-500 underline-offset-4"
            >hello@snappo.me</a
          >
          with steps to reproduce and the affected tool.
        </p>
        <a
          href="https://github.com/Noel-Schmidt/snappo/security/policy"
          target="_blank"
          rel="noopener noreferrer"
          class="text-foreground mt-5 inline-flex text-sm font-medium underline decoration-teal-500 underline-offset-4 transition-colors hover:text-teal-700 dark:hover:text-teal-300"
        >
          Read the security policy
        </a>
      </div>
    </div>
  </section>
</template>
