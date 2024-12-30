import type { SinglePos, Benchmarks, BenchmarkPayload } from "~/types";

import * as benchmarks from "~/constants/benchmarks";
import { CURRENT_BENCHMARK } from "~/constants/routeNames";
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

  const posKey = k.resolvePos(stringifyRoute(route.params.positionSlug));
  const allBenchmarksCacheKey = k.resolveAllPosBenchmarks(
    stringifyRoute(route.params.positionSlug),
    route.name === CURRENT_BENCHMARK
      ? stringifyRoute(route.params.benchmark)
      : route.query.benchmark
        ? stringifyRoute(route.query.benchmark)
        : benchmarks.ACHIEVEMENTS
  );
  const benchmarkCacheKey = k.resolvePosBenchmark(
    stringifyRoute(route.params.positionSlug),
    stringifyRoute(route.query.v)
  );

  const { data: cachedPositionData } = useNuxtData<SinglePos>(posKey);
  const { data: cachedBenchmarksData } = useNuxtData<Benchmarks>(
    allBenchmarksCacheKey
  );
  const { data: cachedBenchmarkPayloadData } =
    useNuxtData<BenchmarkPayload>(benchmarkCacheKey);

  const asyncData = useLazyAsyncData<PositionResponse>(
    async () => {
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

  watch(
    [
      () => route.params.positionSlug,
      () => route.params.benchmark,
      () => route.query.benchmark,
      () => route.query.v,
      () => cachedBenchmarksData.value,
    ],
    ([a, b, c, d, e]) => {
      if (!e) asyncData.refresh();
      else asyncData.execute();
    },
    { immediate: true }
  );

  return asyncData;
}
