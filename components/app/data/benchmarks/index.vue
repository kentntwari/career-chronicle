<script lang="ts" setup>
  import type { Benchmark, Benchmarks, SingleOrg, SinglePos } from "~/types";

  import { useWindowSize } from "@vueuse/core";
  import {
    Plus as LucidePlusIcon,
    SlidersHorizontal as lucideSliderHorizontalIcon,
  } from "lucide-vue-next";

  import * as benchmarks from "~/constants/benchmarks";
  import { resolveProvidedKeys } from "~/utils/keys";
  import { useBenchmarkKey } from "~/composables/useFetchKeys";

  const formComponent = inject(resolveProvidedKeys().form.benchmark);

  const props = defineProps<{
    parentOrganization: SingleOrg["slug"];
    parentPosition: SinglePos["slug"];
    currentBenchmark: Benchmark;
  }>();

  const nuxtApp = useNuxtApp();

  const { width } = useWindowSize();

  const parsedBenchmark = computed(() =>
    queriedBenchmark.safeParse(props.currentBenchmark)
  );

  const computedUrl = computed(() => {
    if (!parsedBenchmark.value.success) return "";
    return `${props.parentOrganization}/position/${props.parentPosition}/benchmarks`;
  });

  const computedQuery = computed(() =>
    parsedBenchmark.value.data?.toLocaleLowerCase()
  );

  const k = useBenchmarkKey();
  const { data, status, execute } = useLazyFetch<Benchmarks>(computedUrl, {
    key: k.value,
    baseURL: "/api/organization",
    method: "GET",
    query: {
      kind: computedQuery,
    },
    immediate: false,
    watch: false,
    getCachedData: (key, nuxtApp) => {
      if (!nuxtApp.payload.data[key]) return;
      return nuxtApp.payload.data[key];
    },
    default: () =>
      ref<Benchmarks>([
        {
          title: "",
          slug: "",
          monthOccuredAt: "JANUARY",
          yearOccuredAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
  });

  const { isLoading } = useDebouncedLoading(status, { minLoadingTime: 300 });

  watch(
    () => parsedBenchmark.value,
    (val) => {
      if (val.success && !nuxtApp.payload.data[k.value]) execute();
    },
    {
      immediate: true,
    }
  );

  const textColor = computed(() => {
    switch (parsedBenchmark.value.data) {
      case benchmarks.ACHIEVEMENTS:
        return "text-success-900";
      case benchmarks.PROJECTS:
        return "text-neutral-grey-1300";
      case benchmarks.CHALLENGES:
        return "text-neutral-grey-1300";
      case benchmarks.FAILURES:
        return "text-danger-900";
      default:
        return "text-neutral-grey-1000";
    }
  });

  const bgColor = computed(() => {
    switch (parsedBenchmark.value.data) {
      case benchmarks.ACHIEVEMENTS:
        return "bg-success-100";
      case benchmarks.PROJECTS:
        return "bg-[#A2ACBD]/40";
      case benchmarks.CHALLENGES:
        return "bg-neutral-grey-500";
      case benchmarks.FAILURES:
        return "bg-danger-200";
      default:
        return "bg-neutral-grey-1000";
    }
  });

  provide(resolveProvidedKeys().benchmark.textColor, textColor);
  provide(resolveProvidedKeys().benchmark.bgColor, bgColor);
  provide(
    resolveProvidedKeys().benchmark.parentOrganization,
    props.parentOrganization
  );
  provide(resolveProvidedKeys().benchmark.parentPosition, props.parentPosition);
  provide(resolveProvidedKeys().benchmark.kind, parsedBenchmark.value.data);
</script>

<template>
  <main class="flex-1 flex flex-col">
    <!-- TODO: Handle when parsing the benchmark query param fails -->
    <div class="flex-1 flex flex-col" v-if="parsedBenchmark.success">
      <nav
        class="w-full px-3 mt-4 my-5 container flex justify-between items-center"
        role="navigation"
      >
        <app-data-benchmarks-tabs
          :default="parsedBenchmark.data"
          role="menu"
          class="mb-6"
          v-if="width >= 480"
        />

        <lazy-app-data-benchmarks-list
          :default="parsedBenchmark.data"
          role="menu"
          v-else
        />

        <menu class="flex gap-1.5">
          <li role="menuitem">
            <ui-popover>
              <template #trigger="{ open }">
                <ui-button
                  variant="neutral"
                  @click="open()"
                  class="text-neutral-grey-1000"
                >
                  <lucide-slider-horizontal-icon />
                </ui-button>
              </template>
            </ui-popover>
          </li>
          <li role="menuitem">
            <ui-popover :align="'end'" :side-offset="10" class="max-w-[90vw]">
              <template #trigger="{ open }">
                <ui-button @click="open()">
                  <lucide-plus-icon />
                </ui-button>
              </template>
              <template #content="{ close }">
                <component
                  :is="formComponent"
                  :parent-organization="parentOrganization"
                  :parent-position="parentPosition"
                  :benchmark="parsedBenchmark.data"
                  @cancel="close()"
                  @form-submitted="close()"
                />
              </template>
            </ui-popover>
          </li>
        </menu>
      </nav>

      <div class="px-3 container">
        <app-data-plan-banner
          :target="parsedBenchmark.data"
          :current-count="data.length"
        />
      </div>

      <div
        class="mt-12 px-3 py-5 bg-neutral-grey-500 flex-1 flex flex-col gap-3"
      >
        <app-skeleton-content v-show="isLoading === 'pending'" />
        <div v-show="isLoading !== 'pending'">
          <!-- handle when there are no benchmarks .i,e data.length === 0 -->
          <slot :data="data" />
        </div>
      </div>
    </div>
  </main>
</template>
