<script lang="ts" setup>
  import type { Benchmark } from "~/types";

  import * as benchmarks from "~/constants/benchmarks";
  import { resolveProvidedKeys } from "~/utils/keys";

  const parentOrganization = inject<string>(
    resolveProvidedKeys().benchmark.parentOrganization
  )!;
  const parentPosition = inject<Benchmark>(
    resolveProvidedKeys().benchmark.parentPosition
  )!;
  const parentBenchmark = inject<Benchmark>(
    resolveProvidedKeys().benchmark.kind
  )!;

  const props = defineProps<{
    data: {
      title: string;
      slug: string;
    };
  }>();

  const computedClass = computed<string>(() => {
    switch (true) {
      case parentBenchmark.toLocaleLowerCase() ===
        benchmarks.CHALLENGES.toLocaleLowerCase():
        return "bg-neutral-grey-300 text-neutral-grey-1100 shadow-[0_5px_13px_rgba(163,163,163,1)]";

      case parentBenchmark.toLocaleLowerCase() ===
        benchmarks.ACHIEVEMENTS.toLocaleLowerCase():
        return "bg-success-100/50 text-success-900 shadow-[0_5px_13px_rgba(25,184,74,1)]";

      default:
        return "";
    }
  });
</script>

<template>
  <context-menu-root>
    <context-menu-trigger as-child>
      <NuxtLink
        v-if="data.slug !== ''"
        :to="{
          name: 'organization-orgSlug-position-positionSlug-benchmarkSlug-valueSlug',
          params: {
            orgSlug: parentOrganization,
            positionSlug: parentPosition,
            benchmarkSlug: parentBenchmark.toLocaleLowerCase(),
            valueSlug: props.data.slug,
          },
        }"
        class="block px-3 py-2 min-h-20 text-md rounded-lg"
        :class="[computedClass]"
      >
        {{ data.title }}
      </NuxtLink>
    </context-menu-trigger>
    <context-menu-portal>
      <context-menu-content
        class="min-w-[150px] z-30 bg-[#fff] outline-none rounded-md p-[4px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade space-y-1"
        :side-offset="20"
      >
        <context-menu-item
          value="Open new tab"
          class="group text-xs leading-none text-neutral-grey-1000 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-4 select-none outline-none data-[disabled]:text-neutral-grey-600 data-[disabled]:pointer-events-none data-[highlighted]:bg-neutral-grey-300 data-[highlighted]:text-neutral-grey-1300"
          @select="openNewTab(`/organization/${data.slug}`)"
        >
          Open new tab
        </context-menu-item>
        <context-menu-item
          value="Change name"
          class="group text-xs leading-none text-neutral-grey-1000 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-4 select-none outline-none data-[disabled]:text-neutral-grey-600 data-[disabled]:pointer-events-none data-[highlighted]:bg-neutral-grey-300 data-[highlighted]:text-neutral-grey-1300"
        >
          Change name
        </context-menu-item>
        <context-menu-item
          value="Delete Organization"
          class="group text-xs leading-none text-danger-700 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-4 select-none outline-none data-[disabled]:text-neutral-grey-600 data-[disabled]:pointer-events-none data-[highlighted]:bg-neutral-grey-300 data-[highlighted]:text-neutral-grey-1300"
        >
          Delete organization
        </context-menu-item>
      </context-menu-content>
    </context-menu-portal>
  </context-menu-root>
</template>
