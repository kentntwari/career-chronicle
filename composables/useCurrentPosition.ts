import type { SinglePos, Benchmarks, BenchmarkPayload } from "~/types";

import * as benchmarks from "~/constants/benchmarks";
import { CURRENT_BENCHMARK, CURRENT_POSITION } from "~/constants/routeNames";
import * as k from "~/utils/keys";

export type PositionResponse = [SinglePos, Benchmarks, BenchmarkPayload | null];

const BASE_URL = "/api/organization";

const fetchCurrentPosition = (org: string, pos: string) =>
  useRequestFetch()<SinglePos>(`${org}/position/${pos}`, { baseURL: BASE_URL });

const fetchAllBenchmarks = (org: string, pos: string, benchmark: string) =>
  useRequestFetch()<Benchmarks>(`${org}/position/${pos}/benchmarks`, {
    baseURL: BASE_URL,
    query: {
      kind: benchmark,
    },
  });

const fetchCurrentBenchmark = (
  org: string,
  pos: string,
  benchmark: string,
  payload: string
) =>
  useRequestFetch()<BenchmarkPayload>(`${org}/position/${pos}/${benchmark}`, {
    baseURL: BASE_URL,
    query: {
      payload,
    },
  });

// FIX: should be able to use watch async option directly instead of a watcher
export function useCurrentPosition() {
  const route = useRoute();

  let posKey = k.resolvePos(stringifyRoute(route.params.positionSlug));
  let allBenchmarksCacheKey = k.resolveAllPosBenchmarks(
    stringifyRoute(route.params.positionSlug),
    route.name === CURRENT_BENCHMARK
      ? stringifyRoute(route.params.benchmark)
      : route.query.benchmark
        ? stringifyRoute(route.query.benchmark)
        : benchmarks.ACHIEVEMENTS
  );
  let benchmarkCacheKey = k.resolvePosBenchmark(
    stringifyRoute(route.params.positionSlug),
    stringifyRoute(route.query.v)
  );

  const asyncData = useLazyAsyncData<PositionResponse>(
    async () => {
      const { data: cachedPositionData } = useNuxtData<SinglePos>(posKey);
      const { data: cachedBenchmarksData } = useNuxtData<Benchmarks>(
        allBenchmarksCacheKey
      );
      const { data: cachedBenchmarkPayloadData } =
        useNuxtData<BenchmarkPayload>(benchmarkCacheKey);

      const [position, benchmarks, currentBenchmark] = await Promise.all([
        !cachedPositionData.value
          ? fetchCurrentPosition(
              stringifyRoute(route.params.orgSlug),
              stringifyRoute(route.params.positionSlug)
            )
          : cachedPositionData.value,
        !cachedBenchmarksData.value
          ? fetchAllBenchmarks(
              stringifyRoute(route.params.orgSlug),
              stringifyRoute(route.params.positionSlug),
              !!route.params.benchmark
                ? stringifyRoute(route.params.benchmark)
                : (route.query.benchmark as string)
            )
          : cachedBenchmarksData.value,
        route.name === CURRENT_BENCHMARK && !cachedBenchmarkPayloadData.value
          ? fetchCurrentBenchmark(
              stringifyRoute(route.params.orgSlug),
              stringifyRoute(route.params.positionSlug),
              stringifyRoute(route.params.benchmark),
              route.query.v?.toString() ?? ""
            )
          : cachedBenchmarkPayloadData.value,
      ]);

      cachedPositionData.value = position;
      cachedBenchmarksData.value = benchmarks;
      cachedBenchmarkPayloadData.value = currentBenchmark;

      return [position, benchmarks, currentBenchmark];
    },
    {
      immediate: false,
      server: false,
      getCachedData(key, nuxtApp) {
        if (!nuxtApp.payload.data[key]) return;
        return nuxtApp.payload.data[key];
      },
      default: () =>
        ref<PositionResponse>([
          {
            title: "",
            slug: "",
            description: "",
            monthStartedAt: "JANUARY",
            yearStartedAt: 1950,
          },
          [],
          {
            title: "",
            slug: "",
            description: "",
            monthStartedAt: "JANUARY",
            yearStartedAt: 1950,
            createdAt: new Date(),
            updatedAt: new Date(),
            isAchievement: true,
            isFailure: false,
            monthFinishedAt: "DECEMBER",
            yearFinishedAt: 1950,
          },
        ]),
    }
  );

  const shouldRefreshPositionData = ref(false);
  const shouldRefreshBenchmarksData = ref(false);
  const shouldRefreshBenchmarkPayloadData = ref(false);

  watch(
    [
      () => route.params.positionSlug,
      () => route.params.benchmark,
      () => route.query.benchmark,
      () => route.query.v,
    ],
    ([
      currentPositionParam,
      currentBenchmarkParam,
      currentBenchmarkQuery,
      currentBenchmarkPayload,
    ]) => {
      if (route.name === CURRENT_POSITION) {
        posKey = k.resolvePos(
          stringifyRoute(stringifyRoute(currentPositionParam))
        );
      }

      if (route.name === CURRENT_BENCHMARK) {
        allBenchmarksCacheKey = k.resolveAllPosBenchmarks(
          stringifyRoute(currentPositionParam),
          stringifyRoute(currentBenchmarkParam ?? benchmarks.ACHIEVEMENTS)
        );
      }

      if (route.name === CURRENT_POSITION) {
        allBenchmarksCacheKey = k.resolveAllPosBenchmarks(
          stringifyRoute(currentPositionParam),
          stringifyRoute(currentBenchmarkQuery ?? benchmarks.ACHIEVEMENTS)
        );
      }

      if (route.name === CURRENT_BENCHMARK) {
        benchmarkCacheKey = k.resolvePosBenchmark(
          stringifyRoute(currentPositionParam),
          stringifyRoute(currentBenchmarkPayload)
        );
      }

      asyncData.execute();
    },
    { immediate: true }
  );

  watchEffect(() => {
    if (shouldRefreshPositionData.value) {
      clearNuxtData(posKey);
      asyncData.refresh();
      shouldRefreshPositionData.value = false;
    }

    if (shouldRefreshBenchmarksData.value) {
      clearNuxtData(allBenchmarksCacheKey);
      asyncData.refresh();
      shouldRefreshBenchmarksData.value = false;
    }

    if (shouldRefreshBenchmarkPayloadData.value) {
      clearNuxtData(benchmarkCacheKey);
      asyncData.refresh();
      shouldRefreshBenchmarkPayloadData.value = false;
    }
  });

  return {
    asyncData,
    shouldRefreshPositionData,
    shouldRefreshBenchmarksData,
    shouldRefreshBenchmarkPayloadData,
  };
}
