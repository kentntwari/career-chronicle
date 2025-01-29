<script lang="ts" setup>
  import type {
    SingleOrg,
    OrgPos,
    Benchmark,
    Benchmarks,
    BenchmarkState,
    ProvidedBenchmarks,
    SinglePos,
  } from "~/types";

  import {
    Calendar as LucideCalendarIcon,
    Puzzle as LucidePuzzleIcon,
    Plus as LucidePlusIcon,
    SlidersHorizontal as lucideSliderHorizontalIcon,
    TrendingUp as LucideTrendingUpIcon,
    TrendingDown as LucideTrendingDownIcon,
  } from "lucide-vue-next";

  import { resolveProvidedKeys } from "~/utils/keys";
  import * as intents from "~/constants/intents";
  import * as benchmarks from "~/constants/benchmarks";
  import * as routeNames from "~/constants/routeNames";
  import { DEFAULT_ORGANIZATION_OBJ } from "~/constants/defaults";

  definePageMeta({
    middleware: ["protected"],
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

  const {
    asyncData: { data, status, error, execute },
    shouldRefreshBenchmarksData,
  } = await useCurrentPosition();

  const { isLoading } = useDebouncedLoading(status, { minLoadingTime: 250 });

  const t = ref<Benchmarks>([]);
  watch(
    () => data.value[1],
    (val) => {
      t.value = val;
    }
  );

  const {
    activeBenchmark: currentBenchmark,
    textClass: activeTextColorClass,
    bgClass: activeBgColorClass,
  } = useActiveBenchmark();

  const isEditPositionTimeline = ref(false);
  const isEditPositionDescription = ref(false);

  const addBenchmark = ref(false);

  function resetPositionPatch() {
    if (isEditPositionTimeline.value) isEditPositionTimeline.value = false;
    else if (isEditPositionTimeline.value)
      isEditPositionDescription.value = false;
  }

  type OptimisticUpdateIntents =
    | "PATCH_POSITION"
    | "CREATE_BENCHMARK"
    | "DELETE_BENCHMARK";
  type OptimisticUpdateOpts = {
    position?: {
      description?: string;
      timeline?: Pick<SinglePos, "monthStartedAt" | "yearStartedAt">;
    };
    benchmark?: {
      new?: Benchmarks[number];
      deleted?: string;
    };
  };
  function optimisticUpdate(
    intent: OptimisticUpdateIntents,
    opts: OptimisticUpdateOpts
  ) {
    if (intent === "DELETE_BENCHMARK" && !!opts?.benchmark?.deleted)
      data.value[1] = data.value[1].filter(
        (b) => b.slug !== opts?.benchmark?.deleted
      ) as Benchmarks;
    else if (intent === "CREATE_BENCHMARK" && !!opts?.benchmark?.new)
      data.value[1].push({
        ...opts?.benchmark?.new,
        slug: opts?.benchmark?.new.slug,
        monthStartedAt: null,
        yearStartedAt: null,
        monthOccuredAt: null,
        yearOccuredAt: null,
      });
    else if (intent === "PATCH_POSITION" && !!opts?.position?.timeline)
      data.value[0] = {
        ...data.value[0],
        monthStartedAt: opts?.position?.timeline?.monthStartedAt,
        yearStartedAt: opts?.position?.timeline?.yearStartedAt,
      };
    else if (intent === "PATCH_POSITION" && !!opts?.position?.description)
      data.value[0] = {
        ...data.value[0],
        description: opts?.position?.description,
      };
  }

  const currentIntent = computed(() => {
    if (isEditPositionTimeline.value) return intents.EDIT_TIMELINE;
    else if (isEditPositionDescription.value) return intents.EDIT_DESCRIPTION;
  });

  const shouldOnboard = computed(() => {
    if (
      currentBenchmark.value === benchmarks.ACHIEVEMENTS &&
      organization.value.hasCreatedAchievementBefore
    )
      return false;
    else if (
      currentBenchmark.value === benchmarks.FAILURES &&
      organization.value.hasCreatedFailureBefore
    )
      return false;
    else if (
      currentBenchmark.value === benchmarks.CHALLENGES &&
      organization.value.hasCreatedChallengeBefore
    )
      return false;
    else if (
      currentBenchmark.value === benchmarks.PROJECTS &&
      organization.value.hasCreatedProjectBefore
    )
      return false;
    else return true;
  });

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

  provide<ProvidedBenchmarks>(resolveProvidedKeys().benchmarks.all, {
    data: t,
    getResourceIndex: (slug) => {
      return data.value[1].findIndex((b) => b.slug === slug);
    },
    deleteBenchmark: (slug) => {
      data.value[1] = data.value[1].filter(
        (b) => b.slug !== slug
      ) as Benchmarks;
    },
  });

  provide<BenchmarkState>(resolveProvidedKeys().benchmarks.state, {
    shouldRefresh: shouldRefreshBenchmarksData,
    update: () => {
      shouldRefreshBenchmarksData.value = true;
    },
  });
</script>

<template>
  <client-only>
    <template #fallback>
      <app-skeleton-pageHeader target="POSITION" />
    </template>
    <ui-dialog>
      <template #trigger="{ open }">
        <app-data-position-pageHeader
          :data="positions"
          :current="data[0].title"
          :started-at="`${data[0].monthStartedAt.toLocaleLowerCase()} ${data[0].yearStartedAt}`"
          :description="data[0].description ?? ''"
          class="border border-neutral-grey-600"
          :class="[error.notFound.position.value ? 'hidden' : '']"
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
          @edit-description="
            () => {
              isEditPositionDescription = true;
              open();
            }
          "
          @edit-timeline="
            () => {
              isEditPositionTimeline = true;
              open();
            }
          "
        />
      </template>
      <template #default="{ close }">
        <visually-hidden>
          <dialog-title></dialog-title>
        </visually-hidden>
        <visually-hidden>
          <dialog-description></dialog-description>
        </visually-hidden>
        <lazy-app-form-patch
          :target="'POSITION'"
          :intent="currentIntent"
          :parent-org="stringifyRoute(route.params.orgSlug)"
          :data="{
            patchedSlug: stringifyRoute(route.params.positionSlug),
            position: {
              timeline: {
                month: data[0].monthStartedAt,
                year: data[0].yearStartedAt,
              },
              description: data[0].description ?? undefined,
            },
          }"
          @cancel="
            () => {
              resetPositionPatch();
              close();
            }
          "
          @update:patch="
            (
              data:
                | string
                | Pick<SinglePos, 'monthStartedAt' | 'yearStartedAt'>,
              patchedSlug: string
            ) => {
              if (currentIntent === 'EDIT_DESCRIPTION')
                optimisticUpdate('PATCH_POSITION', {
                  position: { description: data as string },
                });
              else if (currentIntent === 'EDIT_TIMELINE')
                optimisticUpdate('PATCH_POSITION', {
                  position: {
                    timeline: data as NonNullable<
                      OptimisticUpdateOpts['position']
                    >['timeline'],
                  },
                });

              close();
            }
          "
          v-if="!!currentIntent"
        />
      </template>
    </ui-dialog>
  </client-only>

  <!-- {{ error }} -->

  <div
    class="container nested-container mt-[7.5rem]"
    v-if="error.notFound.position.value"
  >
    <app-error-position-notFound
      :position="stringifyRoute(route.params.positionSlug)"
      :parent-organization="stringifyRoute(route.params.orgSlug)"
      :all-positions="positions"
    />
  </div>

  <div
    v-else-if="
      isLoading === 'error' && route.name === routeNames.CURRENT_POSITION
    "
    class="container nested-container mt-[7.5rem]"
  >
    <app-error-no-data @reload="execute()" />
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
                (data: Benchmarks[number]) => {
                  updateOrgBenchmarkState(b);
                  optimisticUpdate('CREATE_BENCHMARK', {
                    benchmark: { new: data },
                  });
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
                @form-submitted="
                  (data: Benchmarks[number]) => {
                    optimisticUpdate('CREATE_BENCHMARK', {
                      benchmark: { new: data },
                    });
                    close();
                  }
                "
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
      class="mt-12 w-full h-full flex-1 flex flex-col"
      :class="[!shouldOnboard ? 'bg-neutral-grey-500' : '']"
    >
      <div
        class="mt-4 container"
        v-if="status === 'pending' || isLoading === 'pending'"
      >
        <app-skeleton-content class="px-3" />
      </div>
      <div class="container flex-1 grid" v-else>
        <ul
          class="px-3 mt-4 h-full flex xl:grid flex-col xl:grid-flow-col gap-3"
          v-show="route.name === routeNames.CURRENT_POSITION"
        >
          <li v-show="shouldOnboard">
            <app-data-benchmarks-onboarding
              :currentBenchmark="currentBenchmark"
            />
          </li>

          <li
            v-for="benchmark in data[1]"
            v-show="shouldOnboard === false && data[1].length > 0"
            :key="benchmark.slug"
          >
            <app-data-benchmarks-snippet
              :data="{ title: benchmark.title, slug: benchmark.slug }"
              :parent-organization="stringifyRoute(route.params.orgSlug)"
              :parent-position="stringifyRoute(route.params.positionSlug)"
              :parent-benchmark="currentBenchmark"
            />
          </li>

          <li
            v-show="!shouldOnboard && data[1].length === 0"
            class="w-fit m-auto"
          >
            No data found
          </li>
        </ul>

        <section
          v-show="
            !error.notFound.benchmark.value &&
            route.name === routeNames.CURRENT_BENCHMARK
          "
          class="py-4 lg:pt-8 lg:pb-6"
        >
          <NuxtPage :page-key="(route) => route.fullPath" :data="data[2]" />
        </section>
      </div>
    </main>
  </div>
</template>
