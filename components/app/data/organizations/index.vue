<script lang="ts" setup>
  import type { Plan } from "@prisma/client";
  import { cn } from "~/lib/cn";

  interface Props {
    as: string;
    showBanner?: boolean;
  }

  withDefaults(defineProps<Props>(), {
    as: "div",
    showBanner: true,
  });

  const { data, status } = await useLazyFetch("/api/organizations", {
    key: "orgs",
  });

  const createdOrgs = computed(() => {
    return !data.value ? 0 : data.value.length;
  });

  const plan = useState<Plan>("user-plan");
</script>

<template>
  <div class="space-y-14">
    <slot name="banner">
      <app-data-organizations-banner :orgs="data?.length ?? '??'" />
    </slot>
    <component :is="as" :class="cn('space-y-6', $attrs.class ?? '')">
      <div class="h-9 border-b border-neutral-grey-600">
        <h1 class="capitalize font-bold text-md">
          Organizations ({{ createdOrgs }})
        </h1>
      </div>
      <lazy-app-skeleton-organizations v-if="status === 'pending'" />
      <div class="space-y-8" v-else>
        <p v-if="!data">No organizations found</p>
        <p v-else-if="data.length === 0">No organizations created yet</p>
        <div class="flex flex-col gap-4" v-else>
          <app-data-organization-snippet v-for="org in data" :data="org" />
        </div>

        <ui-dialog>
          <template #trigger="{ open: createOrganization }">
            <ui-toast
              type="error"
              title="You have reached the maximum organizations allowed under your plan"
              v-slot="{ triggerToast }"
            >
              <ui-button
                type="button"
                variant="link"
                size="link"
                @click="
                  () => {
                    if (plan.maxOrganizations === data?.length) triggerToast();
                    else createOrganization();
                  }
                "
                >Add organization</ui-button
              >
            </ui-toast>
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
