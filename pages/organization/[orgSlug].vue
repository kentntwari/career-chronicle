<script lang="ts" setup>
  import type { OrgPos, Orgs } from "~/types";

  import { CURRENT_ORGANIZATION } from "~/constants/routeNames";
  import { useCurrentOrganization } from "~/composables/useCurrentOrganization";

  definePageMeta({
    middleware: ["protected"],
  });

  const route = useRoute();

  const cachedOrgs = useNuxtData<Orgs>("orgs");
  const allOrgs = computed<Orgs>(() => cachedOrgs.data.value ?? []);

  await callOnce(async () => {
    if (!cachedOrgs.data.value) {
      cachedOrgs.data.value =
        await useRequestFetch()<Orgs>("/api/organizations");
    }
  });

  const {
    organization: computedOrganization,
    updateOrgBenchmarkState,
    updateOrgPositionState,
    error: organizationNotFoundError,
  } = useCurrentOrganization();

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

  const {
    data,
    status,
    error: positionsError,
    execute,
  } = useLazyAsyncData<OrgPos>(
    () =>
      useRequestFetch()<OrgPos>(`${route.params.orgSlug}/positions`, {
        baseURL: "/api/organization",
        query: {
          month: !!computedMonthQuery.value
            ? computedMonthQuery.value
            : undefined,
          year: !!computedYearQuery.value ? computedYearQuery.value : undefined,
        },
      }),
    {
      immediate: false,
      deep: false,
      default: () => [],
      watch: [computedMonthQuery, computedYearQuery],
    }
  );

  const { isLoading } = useDebouncedLoading(status, { minLoadingTime: 250 });
  const shouldLoadSkeleton = computed(() => {
    if (!computedOrganization.value.hasCreatedPositionBefore) return false;
    if (isLoading.value === "error") return false;
    if (isLoading.value === "pending") return true;
    if (isLoading.value !== "success" && data.value.length === 0) return true;
    return false;
  });

  watch(
    () => computedOrganization.value,
    (d) => {
      if (d.hasCreatedPositionBefore && d.name !== "") execute();
    },
    {
      immediate: true,
    }
  );

  provide(resolveProvidedKeys().organizations.current, {
    organization: computedOrganization,
    updateOrgBenchmarkState,
  });
  provide(resolveProvidedKeys().positions.all, readonly(data));
  provide(resolveProvidedKeys().positions.state, {
    update: () => execute(),
  });
</script>

<template>
  <Head>
    <Title>{{ computedOrganization.name }}</Title>
  </Head>
  <client-only>
    <template #fallback>
      <app-skeleton-pageHeader target="ORGANIZATION" />
    </template>
    <app-data-organization-pageHeader
      :current="computedOrganization.name"
      :data="allOrgs"
      :class="[organizationNotFoundError ? 'hidden' : '']"
      @selected="
        async (o) =>
          await navigateTo({
            name: CURRENT_ORGANIZATION,
            params: { orgSlug: o },
          })
      "
    />
  </client-only>

  <app-error-organization-notFound
    v-if="organizationNotFoundError"
    :organization="stringifyRoute(route.params.orgSlug)"
    :allOrgs="allOrgs"
    class="mt-[4.5rem]"
  />

  <div
    v-else-if="shouldLoadSkeleton && route.name === CURRENT_ORGANIZATION"
    class="container mt-4 px-3"
  >
    <app-skeleton-banner />
    <app-skeleton-positions />
  </div>

  <div
    class="container nested-container mt-[120px]"
    v-else-if="isLoading === 'error'"
  >
    <app-error-no-data :error="positionsError" @reload="execute()">
      <template #default="{ code, handleReload }">
        <ui-button
          variant="link"
          @click="
            () =>
              code === 404
                ? clearError({ redirect: '/organizations' })
                : handleReload()
          "
          class="mt-12 lg:mt-14"
          >{{ code === 404 ? "Go back to organizations" : "Reload" }}</ui-button
        >
      </template>
    </app-error-no-data>
  </div>

  <!-- TODO:Handle the case when the data is null but not necessarily an error -->
  <!-- HERE -->
  <div v-else-if="!computedOrganization">could not find organization</div>

  <div
    class="flex-1 flex flex-col"
    v-else-if="computedOrganization.hasCreatedPositionBefore === false"
  >
    <div class="mt-[4.5rem] ctainer max-w-[366px] text-balance font-medium">
      <p>
        It seems you haven’t registered any checkpoint in your journey at this
        organization.
      </p>
      <br />
      <p>
        Everyone gotta start somewhere. Just type in where you’re at the moment
        with this organization.
      </p>
      <ui-dialog>
        <template #trigger="{ open: createPosition }">
          <app-create-position-btn @create="createPosition()" class="mt-10">
            Get Started
          </app-create-position-btn>
        </template>
        <template #default="{ close }">
          <visually-hidden>
            <dialog-title></dialog-title>
          </visually-hidden>
          <visually-hidden>
            <dialog-description></dialog-description>
          </visually-hidden>
          <app-form-position
            :parent-organization="stringifyRoute(route.params.orgSlug)"
            @cancel="close()"
            @form-submitted="
              () => {
                updateOrgPositionState();
                close();
              }
            "
          />
        </template>
      </ui-dialog>
    </div>
  </div>

  <div class="flex-1 flex flex-col" v-else>
    <NuxtPage />
  </div>
</template>
