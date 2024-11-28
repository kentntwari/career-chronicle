<script setup lang="ts">
  import { TabsIndicator, TabsList, TabsRoot, TabsTrigger } from "radix-vue";

  import * as benchmarks from "~/benchmarks";
  import { resolveProvidedKeys } from "~/utils/keys";

  const props = defineProps<{
    default?: Benchmark;
  }>();

  type Benchmark = (typeof benchmarks)[keyof typeof benchmarks];

  const currentBenchmark = ref<(typeof benchmarks)[keyof typeof benchmarks]>(
    props.default ?? benchmarks.ACHIEVEMENTS
  );

  const textColor = inject<string>(resolveProvidedKeys().benchmark.textColor);
  const bgColor = inject<string>(resolveProvidedKeys().benchmark.bgColor);
</script>

<template>
  <TabsRoot
    class="px-1 h-10 flex items-center bg-[#fff] rounded-lg border border-neutral-grey-600"
    v-model:model-value="currentBenchmark"
    @update:model-value="
      (payload) =>
        navigateTo({
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
