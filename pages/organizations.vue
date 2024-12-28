<script setup lang="ts">
  import type { Orgs, SingleOrg } from "~/types";

  definePageMeta({
    middleware: ["protected"],
  });

  useHead({
    title: "Organizations",
    meta: [
      {
        name: "description",
        content:
          "Manage and record your organizations at different phases of your career",
      },
    ],
  });

  const isFirstTimeUser = useCookie<boolean>("isFirstTime");
  const isCookieNotBoolean = computed(() => {
    if (typeof isFirstTimeUser.value !== "boolean") return true;
    return false;
  });

  onBeforeMount(async () => {
    if (isFirstTimeUser.value || isCookieNotBoolean.value)
      await $fetch("/api/user/first-time");
  });

  const { data: organizations, status } = await useLazyFetch<Orgs>(
    "/api/organizations",
    {
      key: "orgs",
      getCachedData: (_key, nuxtApp) => {
        if (!nuxtApp.payload.data.orgs) return;
        return nuxtApp.payload.data.orgs;
      },
    }
  );

  const { isLoading } = useDebouncedLoading(status, { minLoadingTime: 250 });

  const isDeleting = ref(false);
  const targetedOrg = ref<SingleOrg["slug"]>("");
</script>

<!-- TODO: Fix hydration mismatch -->
<!--  Should be able to apply proper styles and  classes -->
<!-- without having to resort to ClientOnly component -->
<template>
  <main
    class="container px-2"
    :class="`${!isCookieNotBoolean && isFirstTimeUser ? 'mt-[4.5rem]' : 'mt-4'} `"
    data-allow-mismatch
  >
    <div
      v-show="!isCookieNotBoolean"
      :class="[
        isFirstTimeUser ? 'max-w-[366px]' : '',
        !isFirstTimeUser ? 'w-full' : '',
      ]"
      data-allow-mismatch
    >
      <section class="space-y-10" v-if="isFirstTimeUser">
        <p class="font-medium text-balance">
          Hi {{ $auth.user?.given_name }},
          <br />
          <br />
          It's so good to see you here.
          <br />
          <br />
          A career is a journey by itself with lots and lots of things to detail
          for future you.
          <br />
          <br />
          Let's get you up to speed.
        </p>
        <ui-dialog>
          <template #trigger="{ open: createOrganization }">
            <app-create-organization-btn @create="createOrganization()">
              Get Started
            </app-create-organization-btn>
          </template>
          <template v-slot="{ close }" #default>
            <visually-hidden>
              <dialog-title></dialog-title>
            </visually-hidden>
            <visually-hidden
              ><dialog-description></dialog-description
            ></visually-hidden>
            <app-form-organization
              @cancel="close()"
              @form-submitted="
                () => {
                  isFirstTimeUser = false;
                  close();
                }
              "
            />
          </template>
        </ui-dialog>
      </section>

      <template v-else>
        <app-skeleton-content v-show="isLoading === 'pending'" />

        <section class="space-y-6" v-show="isLoading !== 'pending'">
          <app-data-plan-banner
            :target="'ORGANIZATIONS'"
            :current-count="organizations?.length ?? '??'"
            class="mb-14"
          />

          <div class="h-9 border-b border-neutral-grey-600">
            <h1 class="capitalize font-bold text-md">
              Organizations ({{ organizations?.length }})
            </h1>
          </div>

          <div class="space-y-8" v-show="isLoading !== 'pending'">
            <p v-if="!organizations">No organizations found</p>
            <p v-else-if="organizations.length === 0">
              No organizations created yet
            </p>
            <div class="flex flex-col gap-4" v-else>
              <ui-dialog class="dialog-delete">
                <template #trigger="{ open }">
                  <app-data-organization-snippet
                    v-for="org in organizations"
                    :data="org"
                    :key="org.slug"
                    @edit="open()"
                    @delete="
                      () => {
                        isDeleting = true;
                        targetedOrg = org.slug;
                        open();
                      }
                    "
                  />
                </template>
                <template #default="{ close }">
                  <visually-hidden>
                    <dialog-title></dialog-title>
                  </visually-hidden>
                  <visually-hidden
                    ><dialog-description></dialog-description
                  ></visually-hidden>
                  <lazy-app-form-delete
                    :data="targetedOrg"
                    :target="'ORGANIZATION'"
                    @cancel="
                      () => {
                        isDeleting = false;
                        close();
                      }
                    "
                    @update:delete="
                      () => {
                        isDeleting = false;
                        close();
                      }
                    "
                    v-if="isDeleting"
                  />
                </template>
              </ui-dialog>
            </div>

            <ui-dialog>
              <template #trigger="{ open: createOrganization }">
                <app-create-organization-btn
                  :data="organizations ?? []"
                  :variant="'link'"
                  :size="'link'"
                  @create="createOrganization()"
                >
                  Add organization
                </app-create-organization-btn>
              </template>
              <template v-slot="{ close }" #default>
                <visually-hidden>
                  <dialog-title></dialog-title>
                </visually-hidden>
                <visually-hidden
                  ><dialog-description></dialog-description
                ></visually-hidden>
                <app-form-organization
                  @cancel="close()"
                  @form-submitted="close()"
                />
              </template>
            </ui-dialog>
          </div>
        </section>
      </template>
    </div>

    <app-skeleton-content v-show="isCookieNotBoolean" />
  </main>
</template>
