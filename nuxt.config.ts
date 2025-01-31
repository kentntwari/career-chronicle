// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  app: {
    head: {
      link: [
        {
          rel: "stylesheet",
          href: "https://rsms.me/inter/inter.css",
        },
      ],
    },
  },
  // TODO: define middlewares for pages here
  // above nitro, in the hooks
  nitro: {
    storage: {
      data: { driver: "vercelKV", ttl: 60 * 60 * 24 * 30 },
    },
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => ["Icon"].includes(tag),
    },
  },
  experimental: {
    componentIslands: {
      selectiveClient: true,
    },
  },
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/kinde",
    "@nuxt/image",
    "radix-vue/nuxt",
    "@vee-validate/nuxt",
    "@nuxtjs/html-validator",
    "nuxt-svgo",
  ],
  tailwindcss: {
    // cssPath: "~/assets/css/tailwind.css",
    config: {
      theme: {
        screens: {
          sm: "640px",
          md: "744px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1536px",
        },

        container: {
          center: true,
        },
        fontFamily: {
          body: ["InterVariable", "sans-serif"],
        },
        fontSize: {
          "3xs": [
            "0.625rem",
            {
              lineHeight: "0.75rem",
              letterSpacing: "0%",
            },
          ],
          "2xs": [
            "0.75rem",
            {
              lineHeight: "1.125rem",
              letterSpacing: "-0.22px",
            },
          ],
          xs: [
            "0.813rem",
            {
              lineHeight: "1.019rem",
              letterSpacing: "-0%",
            },
          ],
          sm: [
            "0.875rem",
            {
              lineHeight: "1.25rem",
              letterSpacing: "-0.003125em",
            },
          ],
          base: [
            "1rem",
            {
              lineHeight: "1.375rem",
              letterSpacing: "-0.01125em",
            },
          ],
          md: [
            "1.125rem",
            {
              lineHeight: "1.5rem",
              letterSpacing: "-0.01625em",
            },
          ],
          lg: [
            "1.25rem",
            {
              lineHeight: "1.75rem",
              letterSpacing: "-0.02em",
            },
          ],
          xl: [
            "1.5rem",
            {
              lineHeight: "2rem",
              letterSpacing: "-0.03em",
            },
          ],
          "2xl": [
            "2rem",
            {
              lineHeight: "2.5rem",
              letterSpacing: "-0.03em",
            },
          ],
          "3xl": [
            "2.25rem",
            {
              lineHeight: "2.75rem",
              letterSpacing: "-0.03em",
            },
          ],
          "4xl": [
            "3rem",
            {
              lineHeight: "4.5rem",
              letterSpacing: "-0.03em",
            },
          ],
          "5xl": [
            "3.75rem",
            {
              lineHeight: "5.625rem",
              letterSpacing: "-0.03em",
            },
          ],
          "6xl": [
            "4.375rem",
            {
              lineHeight: "6.75rem",
              letterSpacing: "-0.03em",
            },
          ],
        },
        colors: {
          site: "hsl(var(--site-background))",
          "landing-page": "hsl(var(--site-landing-page))",
          "top-nav": "hsl(var(--top-navigation-background))",
          logo: "hsl(var(--logo))",
          body: "hsl(var(--body))",
          "info-bg": "hsl(var(--info-background))",
          "info-text": "hsl(var(--info-text))",
          "crash-notice": "hsl(var(--crash-notice))",
          "neutral-grey": {
            100: "#fdfdfd",
            200: "#f8f8f8",
            300: "#f1f1f1",
            400: "#ececed",
            500: "#e6e6e6",
            600: "#dcdcde",
            700: "#c9c9cc",
            800: "#adacb0",
            900: "#a3a2a6",
            1000: "#4f4d55",
            1100: "#2d2b32",
            1200: "#1d1c20",
            1300: "#0a090b",
          },
          success: {
            100: "#ebfbf1",
            200: "#e1faea",
            300: "#c1f4d4",
            400: "#91ddad",
            500: "#63c888",
            600: "#3bba6a",
            700: "#14ad4d",
            800: "#019939",
            900: "#018030",
            1000: "#016626",
            1100: "#004d1d",
            1200: "#102a19",
            1300: "#001a0a",
          },
          warning: {
            100: "#fff6e7",
            200: "#fff1da",
            300: "#ffe9ba",
            400: "#ffd58f",
            500: "#ffc76a",
            600: "#ffb945",
            700: "#62ac62",
            800: "#ec980c",
            900: "#c47e0a",
            1000: "#346634",
            1100: "#764c06",
            1200: "#4f3304",
            1300: "#271902",
          },
          danger: {
            100: "#fff1f1",
            200: "#ffe3e3",
            300: "#ffc9c9",
            400: "#faa4a4",
            500: "#ff7f7f",
            600: "#f75656",
            700: "#f53535",
            800: "#e12121",
            900: "#bc1c1c",
            1000: "#961616",
            1100: "#711111",
            1200: "#4b0b0b",
            1300: "#260606",
          },
        },
        extend: {
          keyframes: {
            hide: {
              from: { opacity: "1" },
              to: { opacity: "0" },
            },
            slideIn: {
              from: {
                transform: "translateX(calc(100% + var(--viewport-padding)))",
              },
              to: { transform: "translateX(0)" },
            },
            swipeOut: {
              from: { transform: "translateX(var(--radix-toast-swipe-end-x))" },
              to: {
                transform: "translateX(calc(100% + var(--viewport-padding)))",
              },
            },
            slideDownAndFade: {
              from: { opacity: "0", transform: "translateY(-2px)" },
              to: { opacity: "1", transform: "translateY(0)" },
            },
            slideLeftAndFade: {
              from: { opacity: "0", transform: "translateX(2px)" },
              to: { opacity: "1", transform: "translateX(0)" },
            },
            slideUpAndFade: {
              from: { opacity: "0", transform: "translateY(2px)" },
              to: { opacity: "1", transform: "translateY(0)" },
            },
            slideRightAndFade: {
              from: { opacity: "0", transform: "translateX(-2px)" },
              to: { opacity: "1", transform: "translateX(0)" },
            },
          },
          animation: {
            hide: "hide 100ms ease-in",
            slideIn: "slideIn 150ms cubic-bezier(0.16, 1, 0.3, 1)",
            swipeOut: "swipeOut 100ms ease-out",
            slideDownAndFade:
              "slideDownAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
            slideLeftAndFade:
              "slideLeftAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
            slideUpAndFade:
              "slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
            slideRightAndFade:
              "slideRightAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
          },
        },
      },
    },
  },
  svgo: {
    autoImportPath: "~/assets/svg/",
  },
});
