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

  onBeforeMount(async () => {
    if (isFirstTimeUser.value || isCookieNotBoolean.value)
      await $fetch("/api/user/first-time");
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

      <lazy-app-data-organizations as="section" v-else />
    </div>

    <app-skeleton-content v-show="isCookieNotBoolean" />
  </main>
</template>
