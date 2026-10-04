<template>
  <main class="bg-background text-foreground">
    <PageHeader
      title="Snappo FAQ: Online Developer Tools"
      subtitle="Find clear answers about Snappo’s browser-based developer tools, privacy, supported tasks, and how to use each utility."
    >
      <template #heading>
        Snappo FAQ<br /><span class="text-teal-700 dark:text-teal-300"
          >Developer tools, explained.</span
        >
      </template>
    </PageHeader>

    <section class="mx-auto max-w-7xl px-6 py-12 sm:py-16">
      <div class="grid gap-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
        <nav aria-label="FAQ topics" class="h-fit lg:sticky lg:top-24">
          <p class="text-muted-foreground text-sm font-medium">On this page</p>
          <ul class="border-border mt-4 grid gap-2 border-l pl-4 text-sm">
            <li v-for="category in categories" :key="category.id">
              <a
                :href="`#${category.id}`"
                class="text-muted-foreground hover:text-foreground focus-visible:outline-ring inline-flex min-h-11 items-center underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {{ category.title }}
              </a>
            </li>
          </ul>
          <NuxtLink
            to="/tools"
            class="text-foreground mt-6 inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4"
          >
            Browse all tools
          </NuxtLink>
        </nav>

        <div class="min-w-0 space-y-14">
          <p class="text-muted-foreground max-w-3xl leading-7">
            Snappo brings everyday developer utilities into one website. Use this FAQ to learn what
            the tools do, how they handle input, and where to find guidance for specific tasks. For
            tool-specific controls and limits, open the linked tool page before you begin.
          </p>

          <section
            v-for="category in categories"
            :id="category.id"
            :key="category.id"
            :aria-labelledby="`${category.id}-heading`"
            class="scroll-mt-24"
          >
            <div class="mb-5 max-w-2xl">
              <h2
                :id="`${category.id}-heading`"
                class="text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                {{ category.title }}
              </h2>
              <p class="text-muted-foreground mt-2 leading-7">{{ category.intro }}</p>
            </div>

            <Accordion type="single" collapsible class="grid gap-3">
              <AccordionItem
                v-for="(item, index) in category.questions"
                :key="item.question"
                :value="`${category.id}-${index}`"
                class="border-border bg-card data-[state=open]:bg-muted/50 rounded-xl border px-4 transition-colors sm:px-5"
              >
                <AccordionTrigger
                  class="text-foreground focus-visible:outline-ring group flex min-h-14 w-full items-center justify-between gap-5 py-4 text-left text-base font-medium hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <span>{{ item.question }}</span>
                </AccordionTrigger>
                <AccordionContent class="text-muted-foreground pb-5 pr-8 text-sm leading-7">
                  <p v-for="paragraph in item.answer" :key="paragraph" class="mb-3 last:mb-0">
                    {{ paragraph }}
                  </p>
                  <ul v-if="item.links?.length" class="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                    <li v-for="link in item.links" :key="link.to">
                      <NuxtLink
                        :to="link.to"
                        class="text-foreground decoration-border hover:decoration-foreground focus-visible:outline-ring font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
                      >
                        {{ link.label }}
                      </NuxtLink>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section class="border-border border-t pt-8" aria-labelledby="still-need-help">
            <h2 id="still-need-help" class="text-xl font-semibold tracking-tight">
              Still need help?
            </h2>
            <p class="text-muted-foreground mt-3 max-w-3xl leading-7">
              If an answer does not cover your case, send feedback or report a reproducible bug.
              Include the tool name, what you entered, and what you expected; leave out passwords,
              keys, and other private data.
            </p>
            <NuxtLink
              to="/contact"
              class="text-foreground focus-visible:outline-ring mt-4 inline-flex min-h-11 items-center font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Contact Snappo
            </NuxtLink>
          </section>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import PageHeader from '~/components/core/pageHeader.vue'

const title = 'Snappo FAQ: Online Developer Tools and Privacy'
const description =
  'Answers about Snappo’s free online developer tools, browser-based processing, privacy, JSON formatting, converters, password generation, and more.'
const url = 'https://snappo.me/faq'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: url,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

useHead({
  link: [{ rel: 'canonical', href: url }],
})

defineOgImage('Pergel', {
  headline: 'Snappo FAQ',
  title: 'Online developer tools and privacy',
  description,
})

type FaqLink = { label: string; to: string }
type FaqQuestion = { question: string; answer: string[]; links?: FaqLink[] }
type FaqCategory = {
  id: string
  title: string
  intro: string
  questions: FaqQuestion[]
}

const categories: FaqCategory[] = [
  {
    id: 'about-snappo',
    title: 'About Snappo',
    intro: 'What the site offers and how to get started.',
    questions: [
      {
        question: 'What is Snappo?',
        answer: [
          'Snappo is a collection of online developer tools for common tasks involving code, text, data, security, color, and CSS. You can format JSON, compare text, test regular expressions, convert data, generate passwords, and build CSS values from focused tool pages.',
          'Each utility has its own page with controls for that task. Start at the tool catalog, choose a tool, and follow the instructions on its page.',
        ],
        links: [{ label: 'Explore all Snappo tools', to: '/tools' }],
      },
      {
        question: 'Are Snappo’s online tools free to use?',
        answer: [
          'The tools are available on the public Snappo website without a paid plan. You can open a tool and use its available features without creating an account.',
          'The project is open source. You can inspect its code, report an issue, or suggest an improvement through the project’s GitHub repository.',
        ],
        links: [{ label: 'View Snappo on GitHub', to: 'https://github.com/noel-schmidt/snappo' }],
      },
      {
        question: 'Do I need to create an account or install software?',
        answer: [
          'No. Open Snappo in a web browser and choose a tool. The site does not require an account or a desktop installation for its browser tools.',
          'A modern browser is recommended. Individual tools may rely on browser features such as the Clipboard API or Web Crypto for actions like copying a result or generating random values.',
        ],
      },
      {
        question: 'Which developer tools are available on Snappo?',
        answer: [
          'The catalog covers JSON formatting and validation, regex testing, text comparison, code minification, cron expressions, UUIDs, passwords, bcrypt, HMAC, CSV-to-JSON conversion, Base64, URL and HTML entity encoding, timestamps, number bases, Markdown tables, color contrast, palettes, and CSS values such as border radius and box shadow.',
          'The catalog is the current source for available tools and their descriptions. Open a tool page for the options and limitations of that specific utility.',
        ],
        links: [{ label: 'Browse the tool catalog', to: '/tools' }],
      },
      {
        question: 'Can I use Snappo on a phone or tablet?',
        answer: [
          'Snappo pages use responsive layouts, so you can open the site on a phone or tablet as well as a desktop. Some tools are more comfortable to use with a larger screen when they show two text panes or long structured output.',
          'If a control or result does not fit your device, use the page zoom controls or rotate your device. You can also report a specific layout problem from the contact page.',
        ],
        links: [{ label: 'Contact Snappo', to: '/contact' }],
      },
    ],
  },
  {
    id: 'privacy-and-security',
    title: 'Privacy and security',
    intro: 'How to think about input privacy when using browser-based utilities.',
    questions: [
      {
        question: 'Does Snappo upload the text or data I enter?',
        answer: [
          'Snappo tools are designed to process input in your browser when practical. Processing in the browser means the tool can work on the value in the page without sending that value to a Snappo processing service.',
          'Check the individual tool page for its behavior before using confidential data. Browser processing does not protect information from other software, browser extensions, shared devices, or someone who can access your screen.',
        ],
      },
      {
        question:
          'Is it safe to paste passwords, API keys, or confidential code into an online tool?',
        answer: [
          'Avoid entering live passwords, private keys, production tokens, customer records, or other secrets into any website unless your organization has approved that use. A tool running in your browser can reduce transmission to a processing server, but it cannot secure a compromised device, browser extension, or shared session.',
          'For sensitive work, use a trusted local application and follow your organization’s security rules. Use Snappo with sample or non-sensitive values when you are evaluating how a tool works.',
        ],
      },
      {
        question: 'Does Snappo save my tool inputs or keep a history?',
        answer: [
          'Snappo does not provide an account-based workspace or a server-side history of tool inputs. Values are used by the current tool page while you work with it.',
          'The site stores your color theme preference in your browser. Your browser may also retain information through its own history, extensions, clipboard, or form features, so clear those separately on a shared device.',
        ],
      },
      {
        question: 'Does browser-based processing make every result private?',
        answer: [
          'No. Browser-based processing describes where a calculation runs; it is not a guarantee about every part of your device or network. Review the specific tool’s explanation and do not use sensitive values unless the tool and your environment are appropriate for them.',
          'The Snappo FAQ and tool descriptions explain intended behavior, but they do not replace a security review for regulated, confidential, or production data.',
        ],
      },
    ],
  },
  {
    id: 'code-and-data-tools',
    title: 'Code and data tools',
    intro: 'Answers for formatting, comparing, converting, and testing common developer inputs.',
    questions: [
      {
        question: 'How do I format, validate, or minify JSON online?',
        answer: [
          'Open the JSON tool and paste or type a JSON value. You can format it with a chosen indentation, validate the syntax, or minify it to remove formatting whitespace. The tool also offers JSONC input and object-key sorting options.',
          'Validation checks whether the input can be parsed; it does not confirm that the data matches your application’s schema or business rules. Review the result before using it in production.',
        ],
        links: [{ label: 'Open the JSON formatter and validator', to: '/tools/json-tool' }],
      },
      {
        question: 'How can I compare two pieces of text with the diff checker?',
        answer: [
          'Paste the original text into one input and the revised text into the other. The diff checker compares the lines and marks additions, removals, and changed content so you can review what differs.',
          'For the clearest comparison, keep both inputs in the same format and include the surrounding lines that provide context. A text diff reports textual changes; it does not judge whether a code change is correct.',
        ],
        links: [{ label: 'Open the text diff checker', to: '/tools/diff-checker' }],
      },
      {
        question: 'How do I test a regular expression against sample text?',
        answer: [
          'Enter a regular expression and sample text in the regex tester. The page highlights matches and shows capture groups; its syntax reference helps explain common expression features.',
          'A passing match only shows how that pattern behaves for the text you supplied. Test edge cases that reflect your real input, and validate or escape values in your application where needed.',
        ],
        links: [{ label: 'Open the regular expression tester', to: '/tools/regex-tester' }],
      },
      {
        question: 'Can Snappo convert a CSV file or pasted CSV text to JSON?',
        answer: [
          'The CSV-to-JSON converter accepts CSV text and creates an array of objects, using the first row as the object keys. Each following row supplies values for those columns.',
          'Check the output when your file contains unusual delimiters, embedded line breaks, duplicate column names, or inconsistent rows. The generated JSON reflects the converter’s parsing rules, so verify it against your source data before importing it elsewhere.',
        ],
        links: [{ label: 'Open the CSV to JSON converter', to: '/tools/csv-to-json' }],
      },
      {
        question: 'What is the difference between encoding and encrypting Base64 data?',
        answer: [
          'Base64 is an encoding that represents bytes using printable characters. It is useful when data needs a text-safe representation, but it does not hide the original content or require a secret key.',
          'Do not use Base64 to protect passwords, tokens, or private data. Use an appropriate encryption method when confidentiality is required.',
        ],
        links: [{ label: 'Open the Base64 encoder and decoder', to: '/tools/base64-tool' }],
      },
      {
        question: 'Should I encode a URL value or a complete URL?',
        answer: [
          'Use component encoding for an individual value, such as a query parameter, so reserved characters in that value are escaped. Use full-URL encoding only when you intentionally need to encode the URL as a whole string.',
          'Encoding a whole URL and encoding one of its components are different operations. Pick the mode that matches where the result will be used, and decode only values that were encoded using the corresponding format.',
        ],
        links: [{ label: 'Open the URL encoder and decoder', to: '/tools/url-encoder' }],
      },
      {
        question: 'How do Unix timestamps convert to dates and milliseconds?',
        answer: [
          'A Unix timestamp counts time from the Unix epoch. The timestamp converter lets you convert a timestamp to a UTC date or convert an ISO 8601 date to a timestamp in seconds or milliseconds.',
          'Choose the correct unit before converting: a value in seconds is one thousand times smaller than the same instant represented in milliseconds. Check the displayed UTC date to catch a unit mismatch.',
        ],
        links: [{ label: 'Open the timestamp converter', to: '/tools/timestamp-converter' }],
      },
      {
        question: 'What can the number base converter handle?',
        answer: [
          'The number base converter converts whole numbers between binary (base 2), octal (base 8), decimal (base 10), and hexadecimal (base 16). It is useful for checking representations of integer values while coding or learning positional notation.',
          'It is intended for whole numbers. It is not a general converter for fractional values, arbitrary precision decimals, or every numeric notation used by programming languages.',
        ],
        links: [{ label: 'Open the number base converter', to: '/tools/number-base-converter' }],
      },
      {
        question: 'How do I create a Markdown table from rows of data?',
        answer: [
          'Paste tab-separated rows into the Markdown table generator. The first row becomes the table header, and the remaining rows become table body rows. The result is formatted as a Markdown table that you can copy into documentation or a README.',
          'Keep the same number of tab-separated columns on each row for a predictable result. Review cells containing pipes or line breaks after conversion because those characters have special meaning in Markdown tables.',
        ],
        links: [
          { label: 'Open the Markdown table generator', to: '/tools/markdown-table-generator' },
        ],
      },
      {
        question: 'Can the minifier safely optimize any JavaScript, CSS, or HTML?',
        answer: [
          'The minifier removes whitespace and other unnecessary characters from JavaScript, CSS, or HTML using the selected language and action. Minification can make source code harder to read, so keep your original source under version control.',
          'Run your project’s tests and review the generated file before deployment. A smaller output is not proof that the code behaves correctly or that every project-specific build step has been applied.',
        ],
        links: [{ label: 'Open the code minifier', to: '/tools/minifier' }],
      },
    ],
  },
  {
    id: 'security-tools',
    title: 'Password and security tools',
    intro: 'What the password, bcrypt, and HMAC utilities do—and what they do not replace.',
    questions: [
      {
        question: 'How does the Snappo password generator create a password?',
        answer: [
          'Choose a length and select the character groups you want, such as lowercase letters, uppercase letters, numbers, and symbols. The generator uses the browser’s Web Crypto random number generator to choose characters and can exclude look-alike characters or require each selected group to appear.',
          'The displayed strength is an estimate based on the selected options. Use a unique password for each service and store it in a trusted password manager; do not reuse a generated password across accounts.',
        ],
        links: [{ label: 'Open the password generator', to: '/tools/password-generator' }],
      },
      {
        question: 'What does the bcrypt generator do, and what is the cost factor?',
        answer: [
          'The bcrypt tool creates a bcrypt password hash or checks a candidate password against an existing bcrypt hash. Its cost factor controls the amount of work used to compute the hash: a higher cost takes longer to calculate.',
          'A password hash is one-way verification data, not encrypted text that can simply be decrypted. Choose settings based on your application’s requirements and current security guidance, and benchmark them in the environment where your software will run.',
        ],
        links: [{ label: 'Open the bcrypt generator', to: '/tools/bcrypt-generator' }],
      },
      {
        question: 'What is an HMAC, and which algorithms does the tool support?',
        answer: [
          'An HMAC is a message authentication code computed from a message and a secret key. The Snappo HMAC tool can generate or verify HMAC values with SHA-1, SHA-256, SHA-512, or MD5, and can display output in hexadecimal or Base64.',
          'Use the algorithm required by the system you are integrating with. SHA-1 and MD5 options are included for compatibility; they should not be selected for a new design without a specific compatibility requirement. Keep the secret key private.',
        ],
        links: [{ label: 'Open the HMAC generator', to: '/tools/hmac-generator' }],
      },
      {
        question: 'Does the color contrast checker certify that my interface is accessible?',
        answer: [
          'The contrast checker calculates a contrast ratio for the foreground and background colors you enter and compares it with WCAG AA and AAA text criteria. It helps evaluate one part of visual accessibility.',
          'A passing color pair does not certify an entire interface. Accessibility also depends on text size, focus visibility, keyboard operation, labels, semantics, and other design choices. Test the actual interface and relevant states.',
        ],
        links: [{ label: 'Open the color contrast checker', to: '/tools/color-contrast-checker' }],
      },
    ],
  },
  {
    id: 'text-color-and-css',
    title: 'Text, color, and CSS tools',
    intro: 'Quick guidance for common conversions and visual design utilities.',
    questions: [
      {
        question: 'Which color formats can the Snappo color picker convert?',
        answer: [
          'The color picker lets you choose a color and work with its HEX, RGB, and HSL values. The palette generator can build related hues, shades, and tints from a base color.',
          'Color values can look different across displays and color-managed applications. Use the copied value in your target project and check it in the context where it will appear.',
        ],
        links: [
          { label: 'Open the color picker', to: '/tools/color-picker' },
          { label: 'Open the palette generator', to: '/tools/palette-generator' },
        ],
      },
      {
        question: 'How do I generate a CSS border radius or box shadow?',
        answer: [
          'Use the border radius generator to adjust corner values in a preview and copy the resulting CSS declaration. Use the box shadow generator to tune offset, blur, spread, and color, then copy its box-shadow value.',
          'These tools help compose CSS values; they do not add the styles to your project. Paste the result into your stylesheet and adjust it in the context of your layout and design system.',
        ],
        links: [
          { label: 'Open the border radius generator', to: '/tools/border-radius-generator' },
          { label: 'Open the box shadow generator', to: '/tools/box-shadow-generator' },
        ],
      },
      {
        question: 'Can the case converter change text to camelCase, snake_case, or kebab-case?',
        answer: [
          'Yes. The case converter transforms text into common naming styles such as camelCase, snake_case, PascalCase, and kebab-case. Paste the text, choose the output format, and review the result before using it as an identifier.',
          'Automatic word detection can interpret punctuation, abbreviations, and mixed-case input differently from your project’s naming rules. Check the converted name when exact spelling matters.',
        ],
        links: [{ label: 'Open the case converter', to: '/tools/case-converter' }],
      },
      {
        question: 'Can I generate placeholder text with a specific length?',
        answer: [
          'The Lorem Ipsum generator can create placeholder content by word, sentence, or paragraph count. It also provides options for HTML output and other formatting choices shown on the tool page.',
          'Placeholder copy is useful while arranging a layout, but replace it with reviewed content before publishing a page or sending a design for final approval.',
        ],
        links: [{ label: 'Open the Lorem Ipsum generator', to: '/tools/lorem-ipsum-generator' }],
      },
    ],
  },
  {
    id: 'help-and-contributing',
    title: 'Troubleshooting and contributing',
    intro: 'Where to go when an input fails or you want to improve the project.',
    questions: [
      {
        question: 'Why does a tool show an error for my input?',
        answer: [
          'Each utility expects a particular input format. Check the tool’s labels, examples, selected mode, and validation message. For example, JSON must be syntactically valid before it can be formatted, and a timestamp must use the selected seconds or milliseconds unit.',
          'If a valid example still fails, report the tool name and steps to reproduce the issue. Use a small sample with private values removed so the report does not expose credentials or personal data.',
        ],
        links: [{ label: 'Report an issue or send feedback', to: '/contact' }],
      },
      {
        question: 'How do I report a bug or suggest a new developer tool?',
        answer: [
          'Use the contact page to send general feedback or open an issue on GitHub to report a reproducible bug or propose a tool. Include the expected behavior and the steps that led to the problem.',
          'Do not include passwords, API keys, private source code, or personal information in a public issue. Replace sensitive values with representative examples.',
        ],
        links: [{ label: 'Contact Snappo', to: '/contact' }],
      },
      {
        question: 'Where can I read the source code or contribute to Snappo?',
        answer: [
          'Snappo’s source code is available in its public GitHub repository. The README explains the workspace and common commands; contributions can be proposed through a pull request or discussed in an issue.',
          'Before contributing, review the repository guidance and run the relevant checks for the part of the workspace you changed.',
        ],
        links: [
          { label: 'Snappo source code', to: 'https://github.com/noel-schmidt/snappo' },
          { label: 'Read about Snappo', to: '/about' },
        ],
      },
    ],
  },
]
</script>
