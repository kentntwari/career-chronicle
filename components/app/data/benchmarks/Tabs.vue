<script setup lang="ts">
  import type { Benchmark } from "~/types";

  import { TabsList, TabsRoot, TabsTrigger } from "radix-vue";
  import {
    Calendar as LucideCalendarIcon,
    Puzzle as LucidePuzzleIcon,
    TrendingUp as LucideTrendingUpIcon,
    TrendingDown as LucideTrendingDownIcon,
  } from "lucide-vue-next";

  import * as benchmarks from "~/constants/benchmarks";
  import { CURRENT_POSITION } from "~/constants/routeNames";

  interface Props {
    default: Benchmark;
    activeClass: string;
  }

  const props = defineProps<Props>();

  const route = useRoute();

  const currentBenchmark = ref<Benchmark>(props.default);
</script>

<template>
  <TabsRoot
    class="px-1 md:h-10 flex *:flex items-center md:bg-[#fff] rounded-lg md:border md:border-neutral-grey-600"
    v-model:model-value="currentBenchmark"
    @update:model-value="
      async (payload) =>
        await navigateTo({
          name: CURRENT_POSITION,
          params: {
            orgSlug: route.params.orgSlug,
            positionSlug: route.params.positionSlug,
          },
          query: {
            benchmark: payload.toLocaleLowerCase(),
          },
        })
    "
  >
    <TabsList class="relative gap-1.5" aria-label="Select benchmark">
      <TabsTrigger
        v-for="b in benchmarks"
        class="relative w-fit md:px-3 md:h-8 text-sm rounded"
        :class="currentBenchmark === b ? activeClass : ''"
        :value="b"
        :key="b.toLocaleLowerCase()"
      >
        <span class="hidden md:block"> {{ b }}</span>
        <ui-button
          variant="neutral"
          :as="'span'"
          class="block md:hidden border-none"
          :class="[currentBenchmark === b ? activeClass : '']"
        >
          <lucide-trending-up-icon v-show="b === benchmarks.ACHIEVEMENTS" />
          <lucide-puzzle-icon v-show="b === benchmarks.CHALLENGES" />
          <lucide-trending-down-icon v-show="b === benchmarks.FAILURES" />
          <lucide-calendar-icon v-show="b === benchmarks.PROJECTS" />
        </ui-button>
      </TabsTrigger>
    </TabsList>
  </TabsRoot>
</template>
