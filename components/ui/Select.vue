<script lang="ts" setup>
  import { nanoid } from "nanoid";
  import { cn } from "@/lib/cn";
  import { ChevronDown as LucideChevronDownIcon } from "lucide-vue-next";

  const props = defineProps<{
    items: string[] | ReadonlyArray<string>;
    classes?: {
      trigger?: string;
      content?: string;
      item?: string;
    };
    default?: string;
    placeholder?: string;
  }>();

  const emit = defineEmits<{
    "update:selected": [val: string];
  }>();

  const selected = ref("");

  watch(
    () => props.default,
    (val) => {
      if (val) selected.value = val;
    },
    { immediate: true }
  );
</script>

<template>
  <select-root
    :default-value="default"
    v-model:model-value="selected"
    @update:model-value="emit('update:selected', selected)"
  >
    <select-trigger
      :class="
        cn(
          'inline-flex min-w-[160px] items-center justify-between rounded px-[15px] text-sm leading-none h-[35px] gap-[5px] border border-neutral-grey-700 data-[placeholder]:text-neutral-grey-700 outline-none',
          props.classes?.trigger ?? ''
        )
      "
      aria-label="Select a value"
    >
      <select-value
        :placeholder="props.placeholder ?? 'Select a value'"
        class="text-neutral-grey-1300"
      />
      <lucide-chevron-down-icon />
    </select-trigger>

    <select-portal>
      <slot name="content">
        <select-content
          :class="
            cn(
              'min-w-[160px] min-h-[160px] bg-[#fff] rounded shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.20),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] z-[100]',
              props.classes?.content ?? ''
            )
          "
        >
          <select-scroll-up-button
            class="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default"
          >
            <Icon icon="radix-icons:chevron-up" />
          </select-scroll-up-button>

          <select-viewport class="p-[5px]">
            <select-group>
              <select-item
                v-for="item in items"
                :key="nanoid"
                :value="item"
                :class="
                  cn(
                    'text-xs text-neutral-grey-1300 leading-none flex items-center h-8 relative select-none data-[disabled]:text-neutral-grey-700 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-success-400 data-[highlighted]:text-neutral-grey-1100',
                    props.classes?.item ?? ''
                  )
                "
              >
                <select-item-text>
                  {{ item }}
                </select-item-text>
              </select-item>
            </select-group>
          </select-viewport>

          <select-scroll-down-button
            class="flex items-center justify-center h-[25px] bg-white cursor-default"
          >
            <lucide-chevron-down-icon />
          </select-scroll-down-button>
        </select-content>
      </slot>
    </select-portal>
  </select-root>
</template>
