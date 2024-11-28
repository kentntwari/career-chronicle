<script lang="ts" setup>
  import type { Orgs } from "~/types";
  import { cn } from "~/lib/cn";

  interface Props {
    as: string;
  }

  withDefaults(defineProps<Props>(), {
    as: "div",
  });

  const { data, status } = await useLazyFetch<Orgs>("/api/organizations", {
    key: "orgs",
    getCachedData: (_key, nuxtApp) => {
      if (!nuxtApp.payload.data.orgs) return;
      return nuxtApp.payload.data.orgs;
    },
  });

  const { isLoading } = useDebouncedLoading(status, { minLoadingTime: 250 });

  const createdOrgs = computed(() => {
    return !data.value ? 0 : data.value.length;
  });
</script>

<template>
  <div class="space-y-14">
    <app-data-plan-banner
      :target="'ORGANIZATIONS'"
      :current-count="data?.length ?? '??'"
    />
    <component :is="as" :class="cn('space-y-6', $attrs.class ?? '')">
      <div class="h-9 border-b border-neutral-grey-600">
        <h1 class="capitalize font-bold text-md">
          Organizations ({{ createdOrgs }})
        </h1>
      </div>
      <app-skeleton-content v-show="isLoading === 'pending'" />
      <div class="space-y-8" v-show="isLoading !== 'pending'">
        <p v-if="!data">No organizations found</p>
        <p v-else-if="data.length === 0">No organizations created yet</p>
        <div class="flex flex-col gap-4" v-else>
          <app-data-organization-snippet
            v-for="org in data"
            :data="org"
            :key="org.slug"
          />
        </div>

        <ui-dialog>
          <template #trigger="{ open: createOrganization }">
            <app-create-organization-btn
              :data="data ?? []"
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
    </component>
  </div>
</template>
