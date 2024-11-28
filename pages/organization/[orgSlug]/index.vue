<script lang="ts" setup>
  import type { SingleOrg, OrgPos } from "~/types";

  definePageMeta({
    middleware: ["protected"],
    layout: false,
  });

  const nuxtApp = useNuxtApp();

  const router = useRouter();
  const route = useRoute();

  const orgPosKey = useOrgPositionsKey();
  const {
    data: positions,
    status,
    execute: triggerFetchPositions,
  } = useLazyFetch<OrgPos>(`${route.params.orgSlug}/positions`, {
    key: orgPosKey.value,
    baseURL: "/api/organization",
    immediate: false,
    watch: false,
    onRequestError: () => nuxtApp.$abortFetchPositions(),
    onResponseError: () => nuxtApp.$abortFetchPositions(),
    onResponse: () => {
      nuxtApp.$abortFetchPositions();
    },
    getCachedData: (key, nuxtApp) => {
      if (!nuxtApp.payload.data[key]) return;
      return nuxtApp.payload.data[key];
    },
  });

  const { isLoading } = useDebouncedLoading(status, { minLoadingTime: 300 });

  watchEffect(() => {
    if (nuxtApp.$isFetchPositions.value) triggerFetchPositions();
  });

  const nuxtData_organization = useNuxtData<SingleOrg>(
    "org:" + route.params.orgSlug
  );

  function updateOrgPositionState(organization: typeof nuxtData_organization) {
    if (!organization.data.value) return;
    organization.data.value = {
      ...organization.data.value,
      hasCreatedPositionBefore: true,
    };
  }
</script>

<template>
  <main>
    <NuxtLayout
      name="parent-organization"
      @selected="(org) => router.push(`/organization/${org}`)"
    >
      <template #default="{ organization }: { organization: SingleOrg | null }">
        <section class="container">
          <div class="w-full" v-show="isLoading === 'pending'">
            <app-skeleton-positions />
          </div>
          <div
            class="w-full mt-4 px-3 container"
            v-show="isLoading !== 'pending'"
          >
            <app-data-plan-banner
              :target="'POSITIONS'"
              :current-count="positions?.length ?? '??'"
              class="mb-14"
              v-show="organization?.hasCreatedPositionBefore"
            />

            <div
              class="mt-[4.5rem] max-w-[366px] text-balance font-medium"
              v-if="organization?.hasCreatedPositionBefore ? false : true"
            >
              <p>
                It seems you haven’t registered any checkpoint in your journey
                at this organization.
              </p>
              <br />
              <p>
                Everyone gotta start somewhere. Just type in where you’re at the
                moment with this organization.
              </p>
              <ui-dialog>
                <template #trigger="{ open: createPosition }">
                  <app-create-position-btn
                    @create="createPosition()"
                    class="mt-10"
                  >
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
                      organization?.slug ?? stringifyRoute(route.params.orgSlug)
                    "
                    @cancel="close()"
                    @form-submitted="
                      () => {
                        updateOrgPositionState(nuxtData_organization);
                        close();
                      }
                    "
                  />
                </template>
              </ui-dialog>
            </div>

            <p v-else-if="!positions">No positions found</p>
            <p v-else-if="positions.length === 0">No positions created yet</p>

            <app-data-positions
              :data="positions"
              :parent-organization="
                organization?.slug ?? stringifyRoute(route.params.orgSlug)
              "
              v-else
            />
          </div>
        </section>
      </template>
    </NuxtLayout>
  </main>
</template>
