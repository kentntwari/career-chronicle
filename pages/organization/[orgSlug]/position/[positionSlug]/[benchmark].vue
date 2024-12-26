<script lang="ts" setup>
  import type { BenchmarkPayload } from "~/types";

  import { MoveLeft as LucideMoveLeftIcon } from "lucide-vue-next";

  import { CURRENT_POSITION } from "~/constants/routeNames";

  definePageMeta({
    middleware: [
      "protected",
      async (to, from) => {
        const parsed = queriedBenchmark.safeParse(to.params.benchmark);

        if (!parsed.success)
          showError({
            statusCode: 404,
            statusMessage: "Unknown benchmark",
            fatal: true,
          });
        else if (!to.query.v)
          return await navigateTo({
            name: CURRENT_POSITION,
            params: {
              orgSlug: to.params.orgSlug,
              positionSlug: to.params.positionSlug,
            },
            query: {
              benchmark: to.params.benchmark,
            },
          });
      },
    ],
    layout: false,
  });

  defineProps<{
    data: BenchmarkPayload;
  }>();
</script>

<template>
  <div class="px-3 grid grid-cols-1">
    <button
      class="text-neutral-grey-1000"
      @click="
        navigateTo({
          name: CURRENT_POSITION,
          params: {
            orgSlug: $route.params.orgSlug,
            positionSlug: $route.params.positionSlug,
          },
        })
      "
    >
      <LucideMoveLeftIcon :size="24" />
    </button>
    <h1 class="mt-4 font-semibold text-lg text-balance">{{ data.title }}</h1>
    <p class="mt-4">{{ data.description }}</p>
  </div>
</template>
