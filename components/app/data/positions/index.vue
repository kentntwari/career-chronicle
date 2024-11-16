<script lang="ts" setup>
  import type { SingleOrg } from "~/types";
  import type { OrgPos } from "~/types";
  import { cn } from "~/lib/cn";

  interface Props {
    data: OrgPos | null;
    parentOrganization: SingleOrg["slug"];
    isFirstPosition: boolean;
  }

  const props = defineProps<Props>();

  const orgKey = useOrganizationKey();
  const nuxtData_organization = useNuxtData<SingleOrg>(orgKey.value);

  const createdPositions = computed(() => {
    return !props.data ? 0 : props.data.length;
  });

  function updateOrgPositionState(organization: typeof nuxtData_organization) {
    if (!organization.data.value) return;
    organization.data.value = {
      ...organization.data.value,
      hasCreatedPositionBefore: true,
    };
  }
</script>

<template>
  <div
    class="mt-[4.5rem] max-w-[366px] text-balance font-medium"
    v-if="isFirstPosition"
  >
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

  <div class="space-y-14" v-else>
    <slot name="banner">
      <app-data-positions-banner :positions="data?.length ?? '??'" />
    </slot>
    <div :class="cn('space-y-6', $attrs.class ?? '')">
      <div class="h-9 border-b border-neutral-grey-600">
        <h1 class="capitalize font-bold text-md">
          Positions ({{ createdPositions }})
        </h1>
      </div>
      <div class="space-y-8">
        <p v-if="!data">No positions found</p>
        <p v-else-if="data.length === 0">No positions created yet</p>
        <div class="flex flex-col gap-4" v-else>
          <app-data-position-snippet
            v-for="position in data"
            :data="position"
            :parent-organization="parentOrganization"
          />
        </div>

        <ui-dialog>
          <template #trigger="{ open: createOrganization }">
            <app-create-position-btn
              :data="data ?? []"
              :variant="'link'"
              :size="'link'"
              @create="createOrganization()"
            >
              Add position
            </app-create-position-btn>
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
    </div>
  </div>
</template>
