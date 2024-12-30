<script lang="ts" setup>
  import type { OrgPos, Orgs } from "~/types";

  import { CURRENT_ORGANIZATION } from "~/constants/routeNames";
  import { useCurrentOrganization } from "~/composables/useCurrentOrganization";

  definePageMeta({
    middleware: ["protected"],
    layout: false,
  });

  const nuxtApp = useNuxtApp();

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
  } = useCurrentOrganization();

  const pk = resolveOrgPositions(stringifyRoute(route.params.orgSlug));
  const { data, status, error, execute } = await useLazyAsyncData<OrgPos>(
    pk,
    () =>
      useRequestFetch()<OrgPos>(`${route.params.orgSlug}/positions`, {
        baseURL: "/api/organization",
      }),
    {
      immediate: false,
      deep: false,
      default: () => [],
    }
  );

  watch(
    () => computedOrganization.value,
    (d) => {
      if (nuxtApp.payload.data[pk]) data.value = nuxtApp.payload.data[pk];
      else if (d.hasCreatedPositionBefore && d.name !== "") execute();
    },
    {
      immediate: true,
    }
  );

  const { isLoading } = useDebouncedLoading(status, { minLoadingTime: 250 });

  provide(resolveProvidedKeys().organizations.current, {
    organization: computedOrganization,
    updateOrgBenchmarkState,
  });
  provide(resolveProvidedKeys().positions.all, readonly(data));
</script>

<template>
  <client-only>
    <template #fallback>
      <app-skeleton-pageHeader target="ORGANIZATION" />
    </template>
    <app-data-organization-pageHeader
      :current="computedOrganization.name"
      :data="allOrgs"
      @selected="
        async (o) =>
          await navigateTo({
            name: CURRENT_ORGANIZATION,
            params: { orgSlug: o },
          })
      "
    />
  </client-only>

  <div
    v-if="
      (status === 'pending' || isLoading === 'pending') &&
      route.name === CURRENT_ORGANIZATION
    "
  >
    <app-skeleton-positions />
  </div>

  <!-- TODO: Better UI for errors -->
  <div v-else-if="isLoading === 'error'">
    <small>{{ error }}</small>
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
