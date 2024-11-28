<script lang="ts" setup>
  import type { Benchmarks, SingleOrg, SinglePos } from "~/types";

  import { useWindowSize } from "@vueuse/core";
  import { Plus as LucidePlusIcon } from "lucide-vue-next";

  import * as benchmarks from "~/benchmarks";
  import { resolveProvidedKeys } from "~/utils/keys";
  import { useQueriedBenchmarkKey } from "~/composables/useFetchKeys";

  const props = defineProps<{
    parentOrganization: SingleOrg["slug"];
    parentPosition: SinglePos["slug"];
  }>();

  const route = useRoute();

  const nuxtApp = useNuxtApp();

  const { width } = useWindowSize();

  const parsedBenchmark = computed(() =>
    queriedBenchmark.safeParse(route.query.benchmark)
  );

  const computedUrl = computed(() => {
    if (!parsedBenchmark.value.success) return "";
    return `${props.parentOrganization.toLocaleLowerCase()}/position/${props.parentPosition.toLocaleLowerCase()}/benchmarks`;
  });

  const computedQuery = computed(() =>
    parsedBenchmark.value.data?.toLocaleLowerCase()
  );

  const k = useQueriedBenchmarkKey();
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
    default: () => {
      if (nuxtApp.payload.data[k.value]) return nuxtApp.payload.data[k.value];
    },
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

  const renderedComponent = inject(resolveProvidedKeys().form.benchmark);
</script>

<template>
  <div class="flex-1 flex flex-col">
    <nav
      class="w-full px-3 pt-4 container flex justify-between items-center"
      role="navigation"
    >
      <app-data-benchmarks-tabs
        :default="parsedBenchmark.data"
        role="menu"
        class="mb-6"
        v-if="width >= 480"
      />

      <app-data-benchmarks-list
        :default="parsedBenchmark.data ?? benchmarks.ACHIEVEMENTS"
        role="menu"
        v-else
      />

      <ui-popover>
        <template #trigger="{ open }">
          <ui-button class="fixed right-4 bottom-10" @click="open()">
            <lucide-plus-icon />
          </ui-button>
        </template>
        <template #content="{ close }">
          <component
            :is="renderedComponent"
            :parent-organization="parentOrganization"
            :parent-position="parentPosition"
            :benchmark="parsedBenchmark.data ?? benchmarks.ACHIEVEMENTS"
            @cancel="close()"
            @form-submitted="
              () => {
                close();
              }
            "
            class="w-[360px]"
          />
        </template>
      </ui-popover>
    </nav>

    <div class="px-3 container">
      <app-data-plan-banner
        :target="parsedBenchmark.data ?? benchmarks.ACHIEVEMENTS"
        :current-count="data?.length ?? '??'"
      />
    </div>

    <div class="mt-12 px-3 py-4 bg-neutral-grey-500 flex-1 flex flex-col gap-3">
      <div class="px-3 py-4 container" v-show="isLoading === 'pending'">
        <app-skeleton-content class="w-full mt-6" />
      </div>

      <ul
        class="container flex-1 flex flex-col gap-3"
        v-show="isLoading !== 'pending'"
      >
        <li v-for="benchmark in data" :key="benchmark.slug">
          <app-data-benchmarks-snippet
            :category="parsedBenchmark.data"
            :data="{ title: benchmark.title, slug: benchmark.slug }"
            v-if="parsedBenchmark.success"
          />
        </li>
      </ul>
    </div>
  </div>
</template>
