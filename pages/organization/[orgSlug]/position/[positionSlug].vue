<script lang="ts" setup>
  import type { UseFetchOptions } from "nuxt/app";
  import type { SingleOrg, SinglePos, Benchmark } from "~/types";

  import {
    Calendar as LucideCalendarIcon,
    Puzzle as LucidePuzzleIcon,
    TrendingUp as LucideTrendingUpIcon,
    TrendingDown as LucideTrendingDownIcon,
  } from "lucide-vue-next";

  import * as benchmarks from "~/constants/benchmarks";

  definePageMeta({
    middleware: ["protected"],
    layout: false,
  });

  const route = useRoute();

  const orgKey = useOrganizationKey();
  const { data: organization } = useNuxtData<SingleOrg>(orgKey.value);

  const k = useCurrentPositionKey();
  const OPTIONS_POSITION: UseFetchOptions<SinglePos> = {
    key: k.value,
    baseURL: "/api/organization",
    getCachedData: (key, nuxtApp) => {
      if (!nuxtApp.payload.data[key]) return;
      return nuxtApp.payload.data[key];
    },
  } as const;

  const {
    data: position,
    status,
    error,
  } = await useLazyFetch<SinglePos>(
    `${route.params.orgSlug}/position/${route.params.positionSlug}`,
    {
      ...OPTIONS_POSITION,
      default: () =>
        ref<SinglePos>({
          title: "",
          slug: "",
          description: "",
          monthStartedAt: "JANUARY",
          yearStartedAt: 1950,
        }),
    }
  );

  const { isLoading } = useDebouncedLoading(status, { minLoadingTime: 250 });

  const addBenchmark = ref(false);

  const hasCreatedBenchmarks = computed(() => {
    if (
      organization.value?.hasCreatedAchievementBefore ||
      organization.value?.hasCreatedChallengeBefore ||
      organization.value?.hasCreatedFailureBefore ||
      organization.value?.hasCreatedProjectBefore
    )
      return true;

    return false;
  });

  const color = (b: Benchmark) => {
    switch (true) {
      case b === benchmarks.PROJECTS:
        return "bg-[#A2ACBD]";
      case b === benchmarks.ACHIEVEMENTS:
        return "bg-success-300";
      case b === benchmarks.CHALLENGES:
        return "bg-neutral-grey-500";
      case b === benchmarks.FAILURES:
        return "bg-danger-300";
      default:
        return "";
    }
  };

  function createFirst(b: Benchmark) {
    if (!organization.value) return;
    if (b === benchmarks.PROJECTS)
      organization.value.hasCreatedProjectBefore = true;
    else if (b === benchmarks.ACHIEVEMENTS)
      organization.value.hasCreatedAchievementBefore = true;
    else if (b === benchmarks.CHALLENGES)
      organization.value.hasCreatedChallengeBefore = true;
    else if (b === benchmarks.FAILURES)
      organization.value.hasCreatedFailureBefore = true;
  }

  const currentBenchmark = ref<Benchmark>();
  watch(
    [
      () => route.name,
      () => route.params.benchmarkSlug,
      () => route.query.benchmark,
    ],
    ([route, param, query]) => {
      switch (true) {
        case route === "organization-orgSlug-position-positionSlug":
          if (!query) currentBenchmark.value = benchmarks.ACHIEVEMENTS;
          else if (typeof query === "string")
            currentBenchmark.value = query as Benchmark;
          break;

        case route ===
          "organization-orgSlug-position-positionSlug-benchmarkSlug-valueSlug":
          currentBenchmark.value = stringifyRoute(param) as Benchmark;
          break;

        default:
          currentBenchmark.value = benchmarks.ACHIEVEMENTS;
          break;
      }
    },
    {
      immediate: true,
    }
  );

  const renderedComponent = computed(() =>
    resolveComponent("LazyAppFormBenchmark")
  );

  provide(resolveProvidedKeys().form.benchmark, renderedComponent);
</script>

<template>
  <app-data-position-pageHeader
    :position="position.title"
    :started-at="`${position?.monthStartedAt?.toLocaleLowerCase() ?? ''} ${position?.yearStartedAt ?? ''}`"
    :description="position?.description ?? ''"
    class="border border-neutral-grey-600"
    @selected="
      async (position) =>
        await navigateTo({
          name: 'organization-orgSlug-position-positionSlug',
          params: {
            orgSlug: route.params.orgSlug,
            positionSlug: position,
          },
        })
    "
  />
  <div class="container" v-if="isLoading === 'pending'">
    <app-skeleton-content class="mt-10 px-3" />
  </div>
  <!-- TODO: Handle the case where data(positions) is null but not necessarily an error -->
  <!-- TODO: Better UI for errors -->
  <div v-else-if="isLoading === 'error'">
    <slot name="error" :error="error">
      <small>{{ error }}</small>
    </slot>
  </div>
  <div
    v-else-if="!hasCreatedBenchmarks"
    class="mt-[4.5rem] px-3 container text-balance font-medium"
  >
    <p>
      Every position involves its own achievements, challenges, failures or even
      projects.
    </p>
    <br />
    <p>It can be easy to keep count of all that.</p>
    <br />
    <p>Let’s make sure it is documented for future you.</p>
    <ui-button class="mt-10" @click="addBenchmark = true" v-show="!addBenchmark"
      >Get started
    </ui-button>
    <section
      v-show="addBenchmark"
      class="mt-10 p-4 bg-[#fff] rounded-lg space-y-4"
    >
      <span class="text-base font-medium">What do you want to add first?</span>
      <div class="flex flex-col gap-2">
        <ui-dialog v-for="b in benchmarks" :key="b.toLocaleLowerCase()">
          <template #trigger="{ open: createBenchmark }">
            <ui-button
              class="h-20 flex flex-col items-center justify-between rounded-lg capitalize text-neutral-grey-1100"
              :class="[color(b)]"
              @click="
                () => {
                  currentBenchmark = b;
                  createBenchmark();
                }
              "
            >
              <lucide-calendar-icon v-if="b === benchmarks.PROJECTS" />
              <lucide-trending-up-icon
                v-else-if="b === benchmarks.ACHIEVEMENTS"
              />
              <lucide-trending-down-icon
                v-else-if="b === benchmarks.FAILURES"
              />
              <lucide-puzzle-icon v-else />
              <span class="font-bold text-base">{{ b }}</span>
            </ui-button>
          </template>
          <template #default="{ close }">
            <visually-hidden>
              <dialog-title></dialog-title>
            </visually-hidden>
            <visually-hidden>
              <dialog-description></dialog-description>
            </visually-hidden>
            <component
              :is="renderedComponent"
              :parent-organization="route.params.orgSlug"
              :parent-position="route.params.positionSlug"
              :benchmark="currentBenchmark"
              @cancel="close()"
              @form-submitted="
                () => {
                  createFirst(b);
                  close();
                }
              "
            />
          </template>
        </ui-dialog>
      </div>
    </section>
  </div>
  <div class="flex-1 flex flex-col" v-else>
    <app-data-benchmarks
      :key="route.fullPath"
      :current-benchmark="currentBenchmark!"
      :parent-organization="stringifyRoute(route.params.orgSlug)"
      :parent-position="stringifyRoute(route.params.positionSlug)"
    >
      <template #default="{ data: fetchedBenchmarks }">
        <ul
          class="container flex-1 flex flex-col gap-4"
          v-if="route.name === 'organization-orgSlug-position-positionSlug'"
        >
          <li v-for="benchmark in fetchedBenchmarks" :key="benchmark.slug">
            <app-data-benchmarks-snippet
              :data="{ title: benchmark.title, slug: benchmark.slug }"
            />
          </li>
        </ul>
        <NuxtPage v-else />
      </template>
    </app-data-benchmarks>
  </div>
</template>
