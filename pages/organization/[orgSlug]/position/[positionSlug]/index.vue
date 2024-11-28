<script lang="ts" setup>
  import type { SingleOrg, SinglePos } from "~/types";

  import {
    Calendar as LucideCalendarIcon,
    Puzzle as LucidePuzzleIcon,
    TrendingUp as LucideTrendingUpIcon,
    TrendingDown as LucideTrendingDownIcon,
  } from "lucide-vue-next";

  import * as benchmarks from "~/constants/benchmarks";
  import { resolveProvidedKeys } from "~/utils/keys";

  type Benchmark = (typeof benchmarks)[keyof typeof benchmarks];

  definePageMeta({
    middleware: ["protected"],
    layout: false,
  });

  const router = useRouter();
  const route = useRoute();

  const orgKey = useOrganizationKey();
  const nuxtData_organization = useNuxtData<SingleOrg>(orgKey.value);

  const addBenchmark = ref(false);

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
  function hasCreatedBenchmarks(org: SingleOrg) {
    if (
      org.hasCreatedAchievementBefore ||
      org.hasCreatedChallengeBefore ||
      org.hasCreatedFailureBefore ||
      org.hasCreatedProjectBefore
    )
      return true;

    return false;
  }

  function createFirst(b: Benchmark) {
    if (!nuxtData_organization.data.value) return;
    if (b === benchmarks.PROJECTS)
      nuxtData_organization.data.value.hasCreatedProjectBefore = true;
    else if (b === benchmarks.ACHIEVEMENTS)
      nuxtData_organization.data.value.hasCreatedAchievementBefore = true;
    else if (b === benchmarks.CHALLENGES)
      nuxtData_organization.data.value.hasCreatedChallengeBefore = true;
    else if (b === benchmarks.FAILURES)
      nuxtData_organization.data.value.hasCreatedFailureBefore = true;
  }

  const currentBenchMark = ref<Benchmark>();

  const renderedComponent = computed(() =>
    resolveComponent("LazyAppFormBenchmark")
  );

  provide(resolveProvidedKeys().form.benchmark, renderedComponent);
</script>

<template>
  <NuxtLayout
    name="parent-organization"
    @selected="(org) => navigateTo(`/organization/${org}`)"
  >
    <template #default="{ organization }: { organization: SingleOrg }">
      <NuxtLayout
        name="parent-position"
        :parent-organization="organization.slug"
        :is-first-benchmark="hasCreatedBenchmarks(organization)"
        @selected="
          (position) =>
            router.push(
              `/organization/${organization.slug}/position/${position}`
            )
        "
      >
        <template #default="{ position }: { position: SinglePos | null }">
          <main class="flex-1 flex flex-col">
            <div
              v-if="organization && !hasCreatedBenchmarks(organization)"
              class="mt-[4.5rem] px-3 container text-balance font-medium"
            >
              <p>
                Every position involves its own achievements, challenges,
                failures or even projects.
              </p>
              <br />
              <p>It can be easy to keep count of all that.</p>
              <br />
              <p>Let’s make sure it is documented for future you.</p>
              <ui-button
                class="mt-10"
                @click="addBenchmark = true"
                v-show="!addBenchmark"
                >Get started
              </ui-button>
              <section
                v-show="addBenchmark"
                class="mt-10 p-4 bg-[#fff] rounded-lg space-y-4"
              >
                <span class="text-base font-medium"
                  >What do you want to add first?</span
                >
                <div class="flex flex-col gap-2">
                  <ui-dialog
                    v-for="b in benchmarks"
                    :key="b.toLocaleLowerCase()"
                  >
                    <template #trigger="{ open: createBenchmark }">
                      <ui-button
                        class="h-20 flex flex-col items-center justify-between rounded-lg capitalize text-neutral-grey-1100"
                        :class="[color(b)]"
                        @click="
                          () => {
                            currentBenchMark = b;
                            createBenchmark();
                          }
                        "
                      >
                        <lucide-calendar-icon
                          v-if="b === benchmarks.PROJECTS"
                        />
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
                        :parent-organization="
                          organization.slug ?? route.params.orgSlug
                        "
                        :parent-position="
                          position?.slug ?? route.params.positionSlug
                        "
                        :benchmark="currentBenchMark"
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
            <app-data-benchmarks
              :key="route.fullPath"
              :parent-organization="
                organization.slug ?? stringifyRoute(route.params.orgSlug)
              "
              :parent-position="
                position?.slug ?? stringifyRoute(route.params.positionSlug)
              "
              v-else
            />
          </main>
        </template>
      </NuxtLayout>
    </template>
  </NuxtLayout>
</template>
