<script lang="ts" setup>
  import type { OrgPos } from "~/types";

  import {
    organizePositionsByMonth,
    organizePositionsByYear,
  } from "~/utils/zschemas";

  const props = defineProps<{
    initial: OrgPos;
  }>();

  const route = useRoute();

  const computedMonthQuery = computed(() => {
    const parsed = organizePositionsByMonth.safeParse(route.query.month);
    if (!!parsed.success) return parsed.data;
    return null;
  });
  const computedYearQuery = computed(() => {
    const parsed = organizePositionsByYear.safeParse(
      +(route.query.year ?? "0")
    );

    if (!!parsed.success) return parsed.data;
    return null;
  });

  const orgPosKey = useOrgPositionsKey();
  const { data, status, execute } = useLazyFetch<OrgPos>(
    `${route.params.orgSlug}/positions`,
    {
      key:
        orgPosKey.value +
        ":organized:" +
        `${computedMonthQuery.value}-${computedYearQuery.value}`,
      baseURL: "/api/organization",
      deep: false,
      query: {
        month: computedMonthQuery,
        year: computedYearQuery,
      },
      immediate: false,
      watch: false,
      default: () => props.initial,
      getCachedData: (key, nuxtApp) => {
        if (!nuxtApp.payload.data[key]) return;
        return nuxtApp.payload.data[key];
      },
    }
  );

  watch(
    [() => computedMonthQuery.value, () => computedYearQuery.value],
    ([month, year]) => {
      if (month || year) execute();
    },
    {
      immediate: true,
    }
  );

  const { isLoading } = useDebouncedLoading(status, { minLoadingTime: 250 });
</script>

<template>
  <app-skeleton-positions v-if="isLoading === 'pending'" class="py-0" />
  <!-- TODO: Make better empty state -->
  <small v-else-if="!data">No positions founds</small>
  <slot :organizedData="data" v-else />
</template>
