<script lang="ts" setup>
  import { User as LucideUserIcon } from "lucide-vue-next";

  const emit = defineEmits<{
    "update:delete-account": [void];
  }>();

  const kinde = useKindeClient();
  const { data: userData } = useAsyncData("kinde-user", async () => {
    if (!kinde) return null;
    return await kinde.getUser();
  });

  const toggleState = ref(false);

  const { $auth } = useNuxtApp();
</script>

<template>
  <nav class="bg-top-nav h-16 px-3 border border-neutral-grey-600">
    <div class="w-full h-full container flex items-center justify-between">
      <NuxtLink to="/organizations" class="logo" aria-label="CareerChronicle">
        CareerChronicle
      </NuxtLink>
      <figure
        class="bg-[#fff] w-10 h-10 flex items-center justify-center rounded-full overflow-clip"
      >
        <dropdown-menu-root v-model:open="toggleState">
          <client-only>
            <dropdown-menu-trigger>
              <lucide-user-icon
                v-if="!userData"
                :size="20"
                class="block text-neutral-grey-900"
              />

              <div v-else>
                <img
                  :src="!userData.picture ? '' : userData.picture"
                  alt="avatar"
                  loading="lazy"
                  class="w-10 h-10"
                />
              </div>
            </dropdown-menu-trigger>
          </client-only>

          <dropdown-menu-portal>
            <dropdown-menu-content
              class="min-w-28 outline-none bg-[#fff] rounded-md px-2 py-3 space-y-4 will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade text-sm text-neutral-grey-1000"
              :side-offset="16"
              :align="'end'"
              :align-offset="-10"
            >
              <dropdown-menu-item>
                <nuxt-link v-show="$auth.loggedIn" to="/api/logout" external
                  >Sign out</nuxt-link
                >
                <nuxt-link v-show="!$auth.loggedIn" to="/api/login" external
                  >Sign in</nuxt-link
                >
              </dropdown-menu-item>
              <dropdown-menu-item
                as="button"
                v-show="$auth.loggedIn"
                class="text-danger-700"
                @select="emit('update:delete-account')"
              >
                Delete account
              </dropdown-menu-item>
            </dropdown-menu-content>
          </dropdown-menu-portal>
        </dropdown-menu-root>
      </figure>
    </div>
  </nav>
</template>
