<script lang="ts" setup>
  import type { Plan } from "@prisma/client";
  import type { OrgPos, ButtonVariants } from "~/types";

  const emit = defineEmits<{
    create: [void];
  }>();

  interface Props extends ButtonVariants {
    data?: OrgPos;
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
    title="You have reached the maximum positions allowed under your plan"
    v-slot="{ triggerToast }"
  >
    <ui-button
      v-bind="$attrs"
      :size="size"
      :variant="variant"
      type="button"
      @click="
        () => {
          if (plan.maxPositions === data?.length) triggerToast();
          else emit('create');
        }
      "
    >
      <slot />
    </ui-button>
  </ui-toast>
</template>
