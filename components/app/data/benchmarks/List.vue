<script lang="ts" setup>
  import type { Benchmark } from "~/types";

  import {
    Calendar as LucideCalendarIcon,
    Puzzle as LucidePuzzleIcon,
    TrendingUp as LucideTrendingUpIcon,
    TrendingDown as LucideTrendingDownIcon,
  } from "lucide-vue-next";

  import * as benchmarks from "~/constants/benchmarks";
  import { resolveProvidedKeys } from "~/utils/keys";

  const props = defineProps<{
    default: Benchmark;
  }>();

  const textColor = inject<string>(resolveProvidedKeys().benchmark.textColor);
  const bgColor = inject<string>(resolveProvidedKeys().benchmark.bgColor);
</script>

<template>
  <menu class="flex gap-1.5">
    <li
      v-for="b in benchmarks"
      role="menuitem"
      :key="b.toLocaleLowerCase()"
      :title="b.toLocaleLowerCase()"
    >
      <ui-button
        variant="neutral"
        :class="[props.default === b ? `${bgColor} ${textColor}` : '']"
        @click="
          navigateTo({
            name: 'organization-orgSlug-position-positionSlug',
            params: {
              orgSlug: $route.params.orgSlug,
              positionSlug: $route.params.positionSlug,
            },
            query: {
              benchmark: b.toLocaleLowerCase(),
            },
          })
        "
      >
        <lucide-trending-up-icon v-show="b === benchmarks.ACHIEVEMENTS" />
        <lucide-puzzle-icon v-show="b === benchmarks.CHALLENGES" />
        <lucide-trending-down-icon v-show="b === benchmarks.FAILURES" />
        <lucide-calendar-icon v-show="b === benchmarks.PROJECTS" />
      </ui-button>
    </li>
  </menu>
</template>
