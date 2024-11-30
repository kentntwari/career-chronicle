<script lang="ts" setup>
  import type { UseFetchOptions } from "nuxt/app";
  import type { FetchResponse } from "ofetch";
  import type { SingleOrg } from "~/types";

  definePageMeta({
    middleware: ["protected"],
    layout: false,
  });

  const route = useRoute();

  const isOrganizationPath = useMatchOrganizationPath();

  const { $isFetchPositions, $fetchPositions, $abortFetchPositions } =
    useNuxtApp();

  const k = useOrganizationKey();
  const OPTIONS: UseFetchOptions<SingleOrg> = {
    key: k.value,
    baseURL: "/api/organization",
    onRequest: () => {
      if ($isFetchPositions.value) $abortFetchPositions();
    },
    onResponse: ({ response }: { response: FetchResponse<SingleOrg> }) => {
      if (response._data?.hasCreatedPositionBefore && isOrganizationPath.value)
        $fetchPositions();

      if (!isOrganizationPath.value && $isFetchPositions.value)
        $abortFetchPositions();
    },
    getCachedData(key, nuxtApp) {
      if (!nuxtApp.payload.data[key]) return;
      return nuxtApp.payload.data[key];
    },
  } as const;

  const {
    data: organization,
    status,
    error: errorFetchingOrganization,
  } = await useLazyFetch<SingleOrg>(`/${route.params.orgSlug}`, {
    ...OPTIONS,
  });

  const { isLoading } = useDebouncedLoading(status, { minLoadingTime: 250 });

  function updateOrgPositionState() {
    if (!organization.value) return;
    organization.value.hasCreatedPositionBefore = true;
  }
</script>

<template>
  <ClientOnly>
    <template #fallback>
      <app-skeleton-organization />
    </template>

    <app-data-organization-pageHeader
      :organization="organization?.name ?? ''"
      @selected="
        async (o) =>
          await navigateTo({
            name: 'organization-orgSlug',
            params: { orgSlug: o },
          })
      "
    />

    <div v-show="isLoading === 'pending'">
      <app-skeleton-positions />
    </div>

    <!-- TODO:Handle the case when the data is null but not necessarily an error -->
    <!-- HERE -->

    <!-- TODO: Better UI for errors -->
    <div v-if="errorFetchingOrganization">
      <small>{{ errorFetchingOrganization }}</small>
    </div>

    <div
      :class="[
        isLoading === 'pending' ? 'invisible' : 'visible flex-1 flex flex-col',
      ]"
      v-else
    >
      <small v-if="!organization">Could not find organization</small>
      <div
        class="mt-[4.5rem] max-w-[366px] text-balance font-medium"
        v-else-if="organization.hasCreatedPositionBefore ? false : true"
      >
        <p>
          It seems you haven’t registered any checkpoint in your journey at this
          organization.
        </p>
        <br />
        <p>
          Everyone gotta start somewhere. Just type in where you’re at the
          moment with this organization.
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
              :parent-organization="
                organization.slug ?? stringifyRoute(route.params.orgSlug)
              "
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
      <NuxtPage v-else />
    </div>
  </ClientOnly>
</template>
