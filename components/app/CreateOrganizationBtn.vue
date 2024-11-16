<script lang="ts" setup>
  import type { Plan } from "@prisma/client";
  import type { Orgs, ButtonVariants } from "~/types";

  const emit = defineEmits<{
    create: [void];
  }>();

  interface Props extends ButtonVariants {
    data?: Orgs;
  }

  withDefaults(defineProps<Props>(), {
    data: () => [],
    variant: "default",
    size: "default",
  });

  const plan = useState<Plan>("user-plan");
</script>

<template>
  <ui-toast
    type="error"
    title="You have reached the maximum organizations allowed under your plan"
    v-slot="{ triggerToast }"
  >
    <ui-button
      v-bind="$attrs"
      :size="size"
      :variant="variant"
      type="button"
      @click="
        () => {
          if (plan.maxOrganizations === data?.length) triggerToast();
          else emit('create');
        }
      "
    >
      <slot />
    </ui-button>
  </ui-toast>
</template>
