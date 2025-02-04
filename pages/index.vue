<script lang="ts" setup>
  import { useWindowSize } from "@vueuse/core";

  definePageMeta({
    layout: "home",
  });;

  const { width: windowWidthSize } = useWindowSize();

  const footerLogoImg = computed(() => {
    if (windowWidthSize.value > 639) {
      return "/img/logo-stroked.png";
    }
    return "/img/logo-stroked__small.png";
  });

  const valuePropositions = [
    {
      target: "impact",
      summary:
        "You want to easily recall your career impact and keep your achievements organized.",
    },
    {
      target: "competitive",
      summary:
        "You want to stay competitive by keeping your profile and CV up-to-date with every career step.",
    },
    {
      target: "progress",
      summary:
        "You want to track your progress across different fields and stay organized as you explore new opportunities.",
    },
    {
      target: "portfolio",
      summary:
        "You want to streamline your portfolio by documenting every project and milestone for future opportunities.",
    },
  ] as const;

  async function getStarted() {
    return await navigateTo("/organizations");
  }
</script>

<template>
  <div class="container">
    <header
      class="mt-[7.5rem] md:mt-0 md:h-[calc(100vh-4rem)] grid grid-cols-1 grid-rows-auto md:grid-rows-[60%_40%] lg:grid-rows-[75%_25%]"
    >
      <section
        class="mt-0 lg:mt-40 grid grid-cols-2 sm:grid-cols-[auto_1fr_auto] grid-rows-[calc(2rem-6px)_auto_auto] md:grid-rows-[calc(1.75rem+2px)_auto] lg:grid-rows-[minmax(auto,2.625rem)_auto] justify-between gap-y-10 lg:gap-y-16"
      >
        <div
          class="div col-span-3 sm:col-start-2 md:col-start-1 md:mx-auto flex items-center px-3 w-full max-w-full sm:w-auto sm:max-w-fit h-[calc(2rem-6px)] sm:h-[calc(1.75rem+2px)] xl:h-[2.625rem] border border-[#654000] rounded-lg"
        >
          <span
            class="block font-regular text-2xs sm:text-sm md:text-base xl:text-base text-neutral-grey-1300"
            >Record up to 5 journeys for free. Upgrades coming soon</span
          >
        </div>
        <div class="contents">
          <svgo-moon
            class="-rotate-90 sm:rotate-0 sm:row-start-2 col-start-1 text-[5rem] sm:text-[7rem] xl:text-[200px] text-[#654000]"
          ></svgo-moon>
          <h1
            class="row-start-2 col-span-2 lg:col-span-1 lg:col-start-2 sm:justify-self-center md:max-w-[22.5rem] lg:max-w-[28rem] xl:max-w-[828px] font-bold sm:text-center text-2xl lg:text-3xl xl:text-[4rem] xl:leading-[110%] lg:tracking-[-0.03em] text-balance text-[#472d00]"
          >
            <span class="hidden lg:block">
              Document your career and <br />
              keep tabs on the most valuable insights</span
            >
            <span class="lg:hidden">
              Document your career and keep tabs on the most valuable
              insights</span
            >
          </h1>
          <svgo-moon
            class="justify-self-end sm:justify-self-auto sm:row-start-2 text-[5rem] sm:text-[7rem] xl:text-[200px] -rotate-90 sm:rotate-180 text-[#654000]"
          ></svgo-moon>
        </div>
      </section>

      <section
        class="mt-40 md:mt-0 font-medium sm:text-lg lg:text-xl space-y-5 sm:space-y-6 text-landing-page"
      >
        <h2>It is easy to get started:</h2>
        <ul
          class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-none xl:grid-flow-col justify-between gap-y-5 sm:gap-y-8 *:flex *:gap-x-2 *:text-balance"
        >
          <li class="max-w-full sm:max-w-[18.5rem]">
            <span class="block">1.</span>
            <span class="block"
              >Register an organization you work for OR have worked for in the
              past</span
            >
          </li>
          <li
            class="md:max-w-[18.75rem] md:justify-self-end lg:justify-self-start"
          >
            <span class="block">2.</span>
            <span class="block"
              >Record positions and responsabilities you’ve held at that
              organization</span
            >
          </li>
          <li class="md:max-w-[18.75rem]">
            <span class="block">3.</span>
            <span class="block"
              >Add achievements, failures, challenges and projects as
              milestones</span
            >
          </li>
          <li class="md:max-w-[18.75rem] md:justify-self-end">
            <span class="block">4.</span>
            <span class="block"
              >Repeat process 1 to 3 all over again as you track your career
              trajectory</span
            >
          </li>
        </ul>
      </section>
    </header>

    <section class="mt-40 md:mt-60 text-landing-page">
      <h2 class="font-medium sm:text-lg xl:text-xl">
        This is of great value to you if:
      </h2>
      <ul class="mt-6 grid xl:grid-cols-2 gap-5 text-[#233857]">
        <li
          class="h-[17.5rem] xl:h-[30rem] col-span-1 p-4 md:p-6 bg-[#C6D8F8] rounded-lg overflow-clip text-pretty xl:text-balance"
          v-for="{ target, summary } of valuePropositions"
        >
          <p class="font-medium sm:text-lg lg:text-xl">{{ summary }}</p>
          <svgo-triangle
            class="relative top-24 sm:top-4 xl:top-36 left-16 md:left-24 xl:left-20 float-end text-[11rem] sm:text-[16rem] xl:text-[22.5rem] text-[#654000]"
            v-if="target === 'impact'"
          />
          <svgo-crescent
            class="relative top-20 sm:top-0 xl:top-32 left-20 md:left-28 xl:left-36 float-end text-[12.25rem] sm:text-[20rem] xl:text-[25.75rem] text-[#654000]"
            v-if="target === 'competitive'"
          />
          <svgo-wheel
            class="relative top-20 sm:top-10 xl:top-32 left-20 md:left-16 xl:left-36 float-end text-[11rem] sm:text-[16rem] xl:text-[30rem] text-[#654000]"
            v-if="target === 'progress'"
          />
          <svgo-number
            class="relative top-24 sm:top-12 xl:top-40 left-20 md:left-24 xl:left-40 float-end text-[11rem] sm:text-[16rem] xl:text-[22.5rem] text-[#654000]"
            v-if="target === 'portfolio'"
          />
        </li>
      </ul>
      <div class="grid w-full">
        <ui-button
          class="mt-6 lg:mt-12 mx-auto bg-[#654000]"
          @click="getStarted"
          >Get started</ui-button
        >
      </div>
    </section>

    <footer
      class="mt-[7.5rem] sm:mt-40 xl:mt-60 space-y-24 md:space-y-40 xl:space-y-60"
    >
      <h2
        class="capitalize font-bold sm:text-center text-[1.75rem] sm:text-[2rem] xl:text-[4rem] text-[#472D00] leading-[110%]"
      >
        Seamless Career Tracking <br />
        for a smarter future
      </h2>

      <div class="space-y-14 md:space-y-10 lg:space-y-16">
        <nuxt-img
          :src="footerLogoImg"
          sizes="75vw lg:100vw "
          class="w-[340px] sm:w-auto sm:mx-auto"
          alt="Career Journey logo"
          :custom="true"
          v-slot="{ imgAttrs, isLoaded, src }"
        >
          <img v-if="isLoaded" v-bind="imgAttrs" :src="src" />
          <div
            v-else
            class="uppercase font-bold text-[3rem] xl:text-[12.25rem] text-start md:text-center text-[#472D00] leading-[110%] xl:leading-[77%] xl:tracking-[0.015em]"
          >
            Career<br />
            Chronicle
          </div>
        </nuxt-img>
        <div
          class="flex flex-col md:flex-row sm:items-center justify-between text-base text-landing-page"
        >
          <div class="mb-14 md:mb-auto flex flex-col sm:flex-row gap-4">
            <nuxt-link :to="'/terms-and-conditions'"
              >Terms and conditions</nuxt-link
            >
            <nuxt-link :to="'/privacy-policy'">Privacy policy</nuxt-link>
          </div>
          <span class="text-2xs md:text-base"
            >Copyright@Career Chronicle.2025</span
          >
        </div>
      </div>
    </footer>
  </div>
</template>
