<script setup lang="ts">
  import type { Benchmark } from "~/types";
  import { TabsList, TabsRoot, TabsTrigger } from "radix-vue";

  import * as benchmarks from "~/constants/benchmarks";
  import { resolveProvidedKeys } from "~/utils/keys";

  const props = defineProps<{
    default: Benchmark;
  }>();

  const route = useRoute();

  const currentBenchmark = ref<Benchmark>(props.default);

  const textColor = inject<string>(resolveProvidedKeys().benchmark.textColor);
  const bgColor = inject<string>(resolveProvidedKeys().benchmark.bgColor);
</script>

<template>
  <TabsRoot
    class="px-1 h-10 flex items-center bg-[#fff] rounded-lg border border-neutral-grey-600"
    v-model:model-value="currentBenchmark"
    @update:model-value="
      async (payload) =>
        await navigateTo({
          name: 'organization-orgSlug-position-positionSlug',
          params: {
            orgSlug: route.params.orgSlug,
            positionSlug: route.params.positionSlug,
          },
          query: {
            benchmark: payload.toLocaleLowerCase(),
          },
        })
    "
  >
    <TabsList class="relative" aria-label="Select benchmark">
      <TabsTrigger
        v-for="b in benchmarks"
        class="relative w-fit px-3 h-8 text-sm rounded"
        :class="
          currentBenchmark === b
            ? `${bgColor} ${textColor}`
            : 'text-neutral-grey-1000'
        "
        :value="b"
        :key="b.toLocaleLowerCase()"
      >
        {{ b }}
      </TabsTrigger>
    </TabsList>
  </TabsRoot>
</template>
