import type { SinglePos, Benchmarks, BenchmarkPayload } from "~/types";
import { CURRENT_BENCHMARK } from "~/constants/routeNames";

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

  const k = useCurrentPositionKey();
  const allBenchmarksCacheKey = computed(
    () =>
      `pos:${route.params.positionSlug}:all-benchmarks:${route.query.benchmark}`
  );
  const benchmarkCacheKey = computed(
    () => `pos:${route.params.positionSlug}:benchmark-payload:${route.query.v}`
  );

  const asyncData = useLazyAsyncData<PositionResponse>(
    async () => {
      const { data: cachedPositionData } = useNuxtData<SinglePos>(k.value);
      const { data: cachedBenchmarksData } = useNuxtData<Benchmarks>(
        allBenchmarksCacheKey.value
      );
      const { data: cachedBenchmarkPayloadData } =
        useNuxtData<BenchmarkPayload>(benchmarkCacheKey.value);

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
    ],
    () => {
      asyncData.execute();
    },
    { immediate: true }
  );

  return asyncData;
}
