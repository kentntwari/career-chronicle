<script lang="ts" setup>
  import type { OrgPos } from "~/types";

  import {
    X as LucideExitIcon,
    MapPin as LucideMapPinIcon,
    ChevronRight as LucideChevronRightIcon,
    ChevronDown as LucideChevronDownIcon,
  } from "lucide-vue-next";

  const props = defineProps<{
    position: string;
  }>();

  const emit = defineEmits<{
    selected: [pos: OrgPos[number]["slug"]];
  }>();

  const route = useRoute();

  const defaultSelection = useState<string>("selected-position");

  const k = useOrgPositionsKey();

  const { data: cachedOrgPositions } = useNuxtData<OrgPos>("positions");
  const orgPositions = useState<OrgPos>(
    "org:" + k.value + "positions",
    () => []
  );

  const nuxtApp = useNuxtApp();

  watch(
    [() => cachedOrgPositions.value, () => props.position],
    async ([cached, position]) => {
      defaultSelection.value = position;

      if (cached) orgPositions.value = cached;
      else {
        orgPositions.value = await useRequestFetch()<OrgPos>(
          "/api/organization/" + route.params.ogSlug + "/positions"
        );
        nuxtApp.payload.data["positions"] = orgPositions.value;
      }
    },
    {
      immediate: true,
    }
  );

  // TODO:Eventually, create a composable to handle browser history change
  // TODO: ensure that no title is duplicatd
  function handleChange(value: OrgPos[number]["title"]) {
    const selected = orgPositions.value.find((pos) => pos.title === value);
    if (!selected) return;
    emit("selected", selected.slug);
  }
</script>

<template>
  <header
    class="w-full min-h-12 bg-neutral-grey-200 px-3 py-2"
    role="navigation"
  >
    <div class="container px-3 flex items-center justify-between">
      <div class="flex items-center space-x-1">
        <figure
          class="w-8 h-8 bg-[#3E4756] flex justify-center items-center rounded-lg"
        >
          <lucide-map-pin-icon :size="20" color="white" />
        </figure>
        <figure class="px-1">
          <lucide-chevron-right-icon
            :size="16"
            color="#3E4756"
            stroke-width="3"
          />
        </figure>
        <select-root
          v-model="defaultSelection"
          @update:model-value="handleChange"
        >
          <select-trigger
            class="inline-flex min-w-[160px] items-center justify-between rounded px-[15px] text-sm leading-none h-[35px] gap-[5px] border border-neutral-grey-700 data-[placeholder]:text-neutral-grey-700 outline-none"
            aria-label="Select organization"
          >
            <select-value
              placeholder="Select an organization"
              class="text-neutral-grey-1300"
            />
            <lucide-chevron-down-icon />
          </select-trigger>

          <select-portal>
            <select-content
              class="min-w-[160px] bg-[#fff] rounded shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.20),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] z-[100]"
            >
              <select-scroll-up-button
                class="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default"
              >
                <Icon icon="radix-icons:chevron-up" />
              </select-scroll-up-button>

              <select-viewport class="p-[5px]">
                <select-group>
                  <select-item
                    v-for="({ title }, index) in orgPositions"
                    :key="index"
                    class="text-xs text-neutral-grey-900 leading-none flex items-center h-8 relative select-none data-[disabled]:text-neutral-grey-700 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-success-400 data-[highlighted]:text-neutral-grey-1100"
                    :value="title"
                  >
                    <select-item-text>
                      {{ title }}
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
          </select-portal>
        </select-root>
      </div>

      <nuxt-link to="/organizations">
        <span class="md:hidden">
          <lucide-exit-icon :size="20" color="#3E4756" stroke-width="3" />
        </span>
      </nuxt-link>
    </div>
  </header>
</template>
