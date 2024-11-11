<script lang="ts" setup>
  import type { UseFetchOptions } from "#app";
  import type { FetchResponse } from "ofetch";
  import { useDelayedLoading } from "~/composables/useDelayedLoading";
  import type { SingleOrg, OrgPos } from "~/types";

  definePageMeta({
    middleware: ["protected"],
  });

  const route = useRoute();
  const positionUrlregex = /^\/api\/organization\/[\w-]+\/positions$/;
  const isPositionsUrlMatch = positionUrlregex.test(route.path);

  const currentOrg = route.params.orgSlug;

  const APIURL_BASE = "/api/organization";
  const params = ref(
    typeof currentOrg === "string" ? currentOrg : currentOrg.join("/")
  );
  const computedParams = computed(() => `/${params.value}/positions`);

  const {
    isLoading: isFetchingAllResources,
    startLoading: beginFetch,
    stopLoading: cancelFetch,
  } = useDelayedLoading(500);

  const OPTIONS_POSITIONS: UseFetchOptions<OrgPos> = {
    key: "positions-" + params.value,
    baseURL: APIURL_BASE,
    immediate: false,
    deep: false,
    watch: [params],
    onRequestError: () => cancelFetch(),
    onResponse: () => cancelFetch(),
    onResponseError: () => cancelFetch(),
  } as const;

  const OPTIONS_ORGANIZATION: UseFetchOptions<SingleOrg> = {
    key: "org-" + params.value,
    baseURL: APIURL_BASE,
    deep: false,
    onRequestError: () => cancelFetch(),
    onResponseError: () => cancelFetch(),
  } as const;

  const nuxtData_positions = useNuxtData<OrgPos>(OPTIONS_POSITIONS.key!);

  const {
    data: positions,
    status: isFetchingPositions,
    execute: triggerFetchPositions,
  } = useLazyFetch<OrgPos>(computedParams, OPTIONS_POSITIONS);

  const {
    data: organization,
    error: errorFetchingOrganization,
    status: isFetchingOrganization,
  } = await useLazyFetch<SingleOrg>(`/${params.value}`, {
    ...OPTIONS_ORGANIZATION,
    onRequest: () => beginFetch(),
    onResponse: ({ response }: { response: FetchResponse<SingleOrg> }) => {
      if (response._data?.hasCreatedPositionBefore) triggerFetchPositions();
      else cancelFetch();
    },
  });

  const { isLoading: isDebouncedFetchingPositions } = useDebouncedLoading(
    isFetchingPositions,
    { minLoadingTime: 300 }
  );

  watchEffect(() => {
    switch (true) {
      case !nuxtData_positions.data.value &&
        organization.value?.hasCreatedPositionBefore:
        triggerFetchPositions();
        break;

      case isPositionsUrlMatch:
        triggerFetchPositions();

      default:
        break;
    }
  });
</script>

<template>
  <main>
    <div v-if="isFetchingAllResources" data-allow-mismatch>
      <app-skeleton-organization />
    </div>
    <div v-else data-allow-mismatch>
      <template v-if="errorFetchingOrganization">
        <small>{{ errorFetchingOrganization }}</small>
      </template>
      <template v-else>
        <app-data-organization-pageHeader
          :org-title="organization?.name ?? ''"
          @selected="
            (s) => {
              params = s;
            }
          "
        />

        <app-skeleton-Positions
          v-show="isDebouncedFetchingPositions === 'pending'"
        />

        <section
          class="px-3 container"
          v-show="isDebouncedFetchingPositions !== 'pending'"
        >
          <div class="mt-4" v-if="organization?.hasCreatedPositionBefore">
            <app-data-organization-banner
              :positions="positions?.length || '??'"
            />
          </div>
          <div
            class="mt-[4.5rem] max-w-[366px] text-balance font-medium"
            v-else
          >
            <p>
              It seems you haven’t registered any checkpoint in your journey at
              this organization.
            </p>
            <br />
            <p>
              Everyone gotta start somewhere. Just type in where you’re at the
              moment with this organization.
            </p>
            <ui-dialog>
              <template #trigger="{ open: createPosition }">
                <ui-button class="mt-12" @click="createPosition()"
                  >GET STARTED</ui-button
                >
              </template>
              <template #default>
                <app-form-position />
              </template>
            </ui-dialog>
          </div>
        </section>
      </template>
    </div>
  </main>
</template>
