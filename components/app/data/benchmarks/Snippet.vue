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
</script>

<template>
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
</template>
