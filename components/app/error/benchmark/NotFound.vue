<script lang="ts" setup>
  import type { Orgs, OrgPos, Benchmark, Benchmarks } from "~/types";

  import { TriangleAlert as LucideTriangleAlertIcon } from "lucide-vue-next";

  import { CURRENT_BENCHMARK } from "~/constants/routeNames";

  const props = defineProps<{
    parentOrganization: Orgs[number]["slug"];
    parentPosition: OrgPos[number]["slug"];
    benchmark: string;
    benchmarkCategory: Benchmark;
    allBenchmarks: Benchmarks;
  }>();

  async function handleRedirect(b: Benchmarks[number]["title"]) {
    const benchmark = props.allBenchmarks.find(({ title }) => title === b);

    if (!benchmark) return;

    clearError();

    return await navigateTo({
      name: CURRENT_BENCHMARK,
      params: {
        orgSlug: props.parentOrganization,
        positionSlug: props.parentPosition,
        benchmark: props.benchmarkCategory,
      },
      query: {
        v: benchmark.slug,
      },
    });
  }
</script>

<template>
  <div class="container nested-container error-container">
    <div class="space-y-6">
      <lucide-triangle-alert-icon :size="32" class="text-[#816841]" />
      <p class="font-medium text-base lg:text-xl whitespace-pre-line">
        <span class="block"
          >Hmm, there appears to be no results for the '{{ benchmark }}'
          position within this organization.</span
        ><br />
        <span class="block">Try selecting one from this list</span>
      </p>

      <ui-select
        :items="allBenchmarks.map(({ title }) => title)"
        :placeholder="'Select benchmark'"
        :classes="{ trigger: 'bg-[#fff]' }"
        @update:selected="(b) => handleRedirect(b)"
      />
    </div>
  </div>
</template>
