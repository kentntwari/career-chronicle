<script lang="ts" setup>
  import type { SingleOrg, OrgPos, Benchmark } from "~/types";

  import {
    Calendar as LucideCalendarIcon,
    Puzzle as LucidePuzzleIcon,
    Plus as LucidePlusIcon,
    SlidersHorizontal as lucideSliderHorizontalIcon,
    TrendingUp as LucideTrendingUpIcon,
    TrendingDown as LucideTrendingDownIcon,
  } from "lucide-vue-next";

  import * as benchmarks from "~/constants/benchmarks";
  import * as routeNames from "~/constants/routeNames";
  import { DEFAULT_ORGANIZATION_OBJ } from "~/constants/defaults";

  definePageMeta({
    middleware: ["protected"],
    layout: false,
  });

  interface TransformedSingleOrg extends SingleOrg {
    hasCreatedBenchmark: boolean;
  }
  interface ProvideOrganization {
    organization: ComputedRef<TransformedSingleOrg>;
    updateOrgBenchmarkState: (benchmark: Benchmark) => void;
  }
  const { organization, updateOrgBenchmarkState } = inject<ProvideOrganization>(
    resolveProvidedKeys().organizations.current,
    () => ({
      organization: computed(() => ({ ...DEFAULT_ORGANIZATION_OBJ })),
      updateOrgBenchmarkState: () => {},
    }),
    true
  );
  const positions = inject<OrgPos>(
    resolveProvidedKeys().positions.all,
    () => [],
    true
  );

  const route = useRoute();

  const { data, status, error, execute } = await useCurrentPosition();
  const { isLoading } = useDebouncedLoading(status, { minLoadingTime: 250 });

  const {
    activeBenchmark: currentBenchmark,
    textClass: activeTextColorClass,
    bgClass: activeBgColorClass,
  } = useActiveBenchmark();

  const addBenchmark = ref(false);

  const renderedComponent = computed(() =>
    resolveComponent("LazyAppFormBenchmark")
  );

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
</script>

<template>
  <client-only>
    <template #fallback>
      <app-skeleton-pageHeader target="POSITION" />
    </template>
    <app-data-position-pageHeader
      :data="positions"
      :current="data[0].title"
      :started-at="`${data[0].monthStartedAt.toLocaleLowerCase()} ${data[0].yearStartedAt}`"
      :description="data[0].description ?? ''"
      class="border border-neutral-grey-600"
      @selected="
        async (position) => {
          return await navigateTo({
            name: routeNames.CURRENT_POSITION,
            params: {
              orgSlug: route.params.orgSlug,
              positionSlug: position,
            },
          });
        }
      "
    />
  </client-only>

  <!-- TODO: Handle the case where data(positions) is null but not necessarily an error -->
  <!-- TODO: Better UI for errors -->
  <div v-if="status === 'error'">
    <small>{{ error }}</small>
  </div>
  <div
    v-else-if="!organization.hasCreatedBenchmark"
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
                  updateOrgBenchmarkState(b);
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
    <nav
      class="w-full px-3 mt-4 my-6 container flex justify-between items-center"
      aria-label="benchmarks tabs"
    >
      <client-only>
        <template #fallback>
          <app-skeleton-tabs />
        </template>

        <app-data-benchmarks-tabs
          :default="currentBenchmark"
          :active-class="`${activeBgColorClass} ${activeTextColorClass}`"
          role="menu"
          aria-label="desktop"
        />
      </client-only>

      <menu class="flex items-center gap-1.5">
        <li role="menuitem">
          <ui-popover>
            <template #trigger="{ open }">
              <ui-button
                variant="neutral"
                class="text-neutral-grey-1000"
                @click="open()"
              >
                <span class="lg:hidden">
                  <lucide-slider-horizontal-icon />
                </span>
                <span class="uppercase hidden lg:block">Filter</span>
              </ui-button>
            </template>
          </ui-popover>
        </li>
        <li role="menuitem">
          <ui-popover :align="'end'" :side-offset="10" class="max-w-[90vw]">
            <template #trigger="{ open }">
              <ui-button @click="open()">
                <span class="lg:hidden"><lucide-plus-icon /></span>
                <span class="uppercase hidden lg:block">Add new</span>
              </ui-button>
            </template>
            <template #content="{ close }">
              <component
                :is="renderedComponent"
                :parent-organization="stringifyRoute(route.params.orgSlug)"
                :parent-position="stringifyRoute(route.params.positionSlug)"
                :benchmark="currentBenchmark"
                @cancel="close()"
                @form-submitted="close()"
              />
            </template>
          </ui-popover>
        </li>
      </menu>
    </nav>
    <client-only>
      <template #fallback>
        <app-skeleton-banner />
      </template>
      <div class="container">
        <app-data-plan-banner
          :target="currentBenchmark"
          :current-count="data[1].length"
        />
      </div>
    </client-only>
    <main
      class="mt-12 pt-4 pb-5 w-full h-full bg-neutral-grey-500 flex-1 flex flex-col"
    >
      <div
        class="container"
        v-if="status === 'pending' || isLoading === 'pending'"
      >
        <app-skeleton-content class="px-3" />
      </div>
      <div class="container" v-else>
        <ul
          class="px-3 space-y-3"
          v-show="route.name === routeNames.CURRENT_POSITION"
        >
          <li v-for="benchmark in data[1]" :key="benchmark.slug">
            <app-data-benchmarks-snippet
              :data="{ title: benchmark.title, slug: benchmark.slug }"
              :parent-organization="stringifyRoute(route.params.orgSlug)"
              :parent-position="stringifyRoute(route.params.positionSlug)"
              :parent-benchmark="currentBenchmark"
            />
          </li>
        </ul>

        <section v-show="route.name === routeNames.CURRENT_BENCHMARK">
          <NuxtPage :page-key="(route) => route.fullPath" :data="data[2]" />
        </section>
      </div>
    </main>
  </div>
</template>
