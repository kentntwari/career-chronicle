import type { Benchmark } from "~/types";

import * as benchmarks from "~/constants/benchmarks";

interface UseActiveBenchmark {
  activeBenchmark: Ref<Benchmark>;
  textClass: ComputedRef<string>;
  bgClass: ComputedRef<string>;
}

const ACHIEVEMENTS_TEXT_CLASS = "text-success-900";
const PROJECTS_TEXT_CLASS = "text-neutral-grey-1300";
const CHALLENGES_TEXT_CLASS = "text-neutral-grey-1300";
const FAILURES_TEXT_CLASS = "text-danger-900";
const ACHIEVEMENTS_BG_CLASS = "bg-success-100";
const PROJECTS_BG_CLASS = "bg-[#A2ACBD]/40";
const CHALLENGES_BG_CLASS = "bg-[#A2ACBD]/20";
const FAILURES_BG_CLASS = "bg-danger-100";
const NEUTRAL_BG_CLASS = "bg-neutral-grey-100";
const NEUTRAL_TEXT_CLASS = "text-neutral-grey-1000";

export function useActiveBenchmark(
  defaultValue?: Benchmark
): UseActiveBenchmark {
  const currentBenchmark = ref<Benchmark>(
    defaultValue ?? benchmarks.ACHIEVEMENTS
  );

  const route = useRoute();

  const textClass = computed(() => {
    switch (currentBenchmark.value) {
      case benchmarks.ACHIEVEMENTS:
        return ACHIEVEMENTS_TEXT_CLASS;
      case benchmarks.PROJECTS:
        return PROJECTS_TEXT_CLASS;
      case benchmarks.CHALLENGES:
        return CHALLENGES_TEXT_CLASS;
      case benchmarks.FAILURES:
        return FAILURES_TEXT_CLASS;
      default:
        return NEUTRAL_TEXT_CLASS;
    }
  });

  const bgClass = computed(() => {
    switch (currentBenchmark.value) {
      case benchmarks.ACHIEVEMENTS:
        return ACHIEVEMENTS_BG_CLASS;
      case benchmarks.PROJECTS:
        return PROJECTS_BG_CLASS;
      case benchmarks.CHALLENGES:
        return CHALLENGES_BG_CLASS;
      case benchmarks.FAILURES:
        return FAILURES_BG_CLASS;
      default:
        return NEUTRAL_BG_CLASS;
    }
  });

  watch(
    [() => route.params.benchmark, () => route.query.benchmark],
    ([p, q]) => {
      const parsedQuery = queriedBenchmark.safeParse(q);
      const parsedParams = queriedBenchmark.safeParse(p);
      if (!!p && parsedParams.success) {
        currentBenchmark.value = parsedParams.data;
      } else if (!!q && parsedQuery.success) {
        currentBenchmark.value = parsedQuery.data;
      }
    },
    { immediate: true }
  );

  return {
    activeBenchmark: currentBenchmark,
    textClass,
    bgClass,
  };
}
