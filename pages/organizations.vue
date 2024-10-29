<script setup lang="ts">
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

  onMounted(async () => {
    if (isFirstTimeUser.value || isCookieNotBoolean.value)
      await $fetch("/api/user/verify-first-time-user");
  });

  const { data } = useFetch("/api/organizations", {
    key: "orgs",
  });

  const createdOrgs = computed(() => {
    return !data.value ? 0 : data.value.length;
  });
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
        isFirstTimeUser ? 'max-w-[366px] space-y-10' : '',
        !isFirstTimeUser ? 'w-full space-y-14' : '',
      ]"
      data-allow-mismatch
    >
      <template v-if="isFirstTimeUser">
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
        <app-dialog-create-organization>
          <template #trigger>
            <ui-button type="button">Get Started</ui-button>
          </template>
          <template v-slot="{ close }" #default>
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
        </app-dialog-create-organization>
      </template>

      <template v-else>
        <header
          class="w-full bg-info-bg/15 px-3 py-[10px] space-y-4 rounded-lg"
          role="organizations-limits-banner"
          aria-label="organizations-limits"
        >
          <p class="font-regular text-sm text-info-text text-balance">
            Record up to 5 organizations for free. Upgrades coming soon
          </p>
          <small
            class="block font-medium text-sm text-neutral-grey-1300 text-balance"
            >{{ createdOrgs }}/5 created</small
          >
        </header>
        <section class="space-y-6">
          <div class="h-9 border-b border-neutral-grey-600">
            <h1 class="capitalize font-bold text-md">
              Organizations ({{ createdOrgs }})
            </h1>
          </div>
          <div class="space-y-8">
            <span v-if="!data">No organizations found</span>
            <span v-else-if="data.length < 0"
              >No organizations created yet</span
            >
            <div class="flex flex-col gap-4" v-else>
              <nuxt-link
                v-for="org in data"
                :to="org.slug"
                class="inline-flex items-center gap-x-2"
              >
                <lucide-flag :size="18" class="fill-body"></lucide-flag>
                <span class="font-medium capitalize">{{ org.name }}</span>
              </nuxt-link>
            </div>

            <app-dialog-create-organization>
              <template #trigger>
                <ui-button type="button" variant="link" size="link"
                  >Add organization</ui-button
                >
              </template>
              <template v-slot="{ close }" #default>
                <app-form-organization
                  @cancel="close()"
                  @form-submitted="close()"
                />
              </template>
            </app-dialog-create-organization>
          </div>
        </section>
      </template>
    </div>

    <div class="max-w-[360px] space-y-10" v-show="isCookieNotBoolean">
      <div class="w-40 h-6 bg-neutral-grey-600 animate-pulse rounded-lg"></div>
      <div
        class="w-full h-6 bg-neutral-grey-600 animate-pulse rounded-lg"
      ></div>
      <div
        class="w-full h-6 bg-neutral-grey-600 animate-pulse rounded-lg"
      ></div>
      <div
        class="w-full h-6 bg-neutral-grey-600 animate-pulse rounded-lg"
      ></div>
    </div>
  </main>
</template>
