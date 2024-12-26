<script lang="ts" setup>
  import type { Benchmark, SingleOrg, SinglePos } from "~/types";

  import * as benchmarks from "~/constants/benchmarks";
  import { CURRENT_BENCHMARK } from "~/constants/routeNames";

  const props = defineProps<{
    data: {
      title: string;
      slug: string;
    };
    parentOrganization: SingleOrg["slug"];
    parentPosition: SinglePos["slug"];
    parentBenchmark: Benchmark;
  }>();

  const computedClass = computed<string>(() => {
    switch (true) {
      case props.parentBenchmark.toLocaleLowerCase() ===
        benchmarks.CHALLENGES.toLocaleLowerCase():
        return "bg-neutral-grey-300 text-neutral-grey-1100 shadow-[0_5px_13px_rgba(163,163,163,1)]";

      case props.parentBenchmark.toLocaleLowerCase() ===
        benchmarks.ACHIEVEMENTS.toLocaleLowerCase():
        return "bg-success-100/50 text-success-900 shadow-[0_5px_13px_rgba(25,184,74,1)]";

      default:
        return "";
    }
  });

  const computedSingularBenchmarkName = computed(() => {
    if (props.parentBenchmark === benchmarks.ACHIEVEMENTS) return "achievement";
    if (props.parentBenchmark === benchmarks.PROJECTS) return "project";
    if (props.parentBenchmark === benchmarks.FAILURES) return "failure";
    if (props.parentBenchmark === benchmarks.CHALLENGES) return "challenge";
  });
</script>

<template>
  <context-menu-root>
    <context-menu-trigger as-child>
      <NuxtLink
        v-if="data.slug !== ''"
        :to="{
          name: CURRENT_BENCHMARK,
          params: {
            orgSlug: parentOrganization,
            positionSlug: parentPosition,
            benchmark: parentBenchmark.toLocaleLowerCase(),
          },
          query: {
            v: props.data.slug,
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
          Open in new tab
        </context-menu-item>
        <context-menu-item
          value="Change name"
          class="group text-xs leading-none text-neutral-grey-1000 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-4 select-none outline-none data-[disabled]:text-neutral-grey-600 data-[disabled]:pointer-events-none data-[highlighted]:bg-neutral-grey-300 data-[highlighted]:text-neutral-grey-1300"
        >
          Edit {{ computedSingularBenchmarkName }}
        </context-menu-item>
        <context-menu-item
          value="Delete Organization"
          class="group text-xs leading-none text-danger-700 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-4 select-none outline-none data-[disabled]:text-neutral-grey-600 data-[disabled]:pointer-events-none data-[highlighted]:bg-neutral-grey-300 data-[highlighted]:text-neutral-grey-1300"
        >
          Delete {{ computedSingularBenchmarkName }}
        </context-menu-item>
      </context-menu-content>
    </context-menu-portal>
  </context-menu-root>
</template>
