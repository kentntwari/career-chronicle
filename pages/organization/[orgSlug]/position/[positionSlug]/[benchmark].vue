<script lang="ts" setup>
  import type {
    Benchmark,
    BenchmarkPayload,
    ProvidedBenchmarks,
    SinglePos,
  } from "~/types";

  import { format } from "date-fns";
  import { useWindowSize, whenever } from "@vueuse/core";

  import {
    Trash2 as LucideTrash2Icon,
    PenLine as LucidePenLineIcon,
    MoveLeft as LucideMoveLeftIcon,
    Ellipsis as LucideEllipsisIcon,
    ChevronLeft as LucideChevronLeftIcon,
    ChevronRight as LucideChevronRightIcon,
  } from "lucide-vue-next";

  import { CURRENT_BENCHMARK, CURRENT_POSITION } from "~/constants/routeNames";
  import * as intents from "~/constants/intents";
  import * as benchmarks from "~/constants/benchmarks";

  definePageMeta({
    middleware: [
      "protected",
      async (to, from) => {
        const parsed = queriedBenchmark.safeParse(to.params.benchmark);

        if (!parsed.success)
          showError({
            statusCode: 404,
            statusMessage: "Unknown benchmark",
            fatal: true,
          });
        else if (!to.query.v)
          return await navigateTo({
            name: CURRENT_POSITION,
            params: {
              orgSlug: to.params.orgSlug,
              positionSlug: to.params.positionSlug,
            },
            query: {
              benchmark: to.params.benchmark,
            },
          });
      },
    ],
    layout: false,
  });

  const props = defineProps<{
    data: BenchmarkPayload;
  }>();

  // This will be used to easily patch the data and show it in the UI
  const initialData = ref<BenchmarkPayload>(props.data);
  const payload = computed<BenchmarkPayload>({
    get(previous) {
      return props.data;
    },
    set(next) {
      initialData.value = { ...next };
    },
  });

  const isDescriptionNotFound = computed(() => {
    if (!payload.value.description) return true;
    if (payload.value.description.trim() === "") return true;
    return false;
  });

  const { width } = useWindowSize();

  const triggerRef = useTemplateRef("trigger");

  const route = useRoute();
  const currentBenchmark = stringifyRoute(
    route.params.benchmark
  ).toLocaleUpperCase() as Benchmark;

  const injected = inject<ProvidedBenchmarks>(
    resolveProvidedKeys().benchmarks.all,
    {
      data: ref([]),
      getResourceIndex: () => undefined,
      deleteBenchmark: () => {},
    },
    true
  );

  whenever(
    () => width.value > 1024 && !!triggerRef.value,
    (val) => {
      if (triggerRef.value) {
        triggerRef.value.$el.click();
      }
    }
  );

  const formattedDate = computed(() => {
    const createdAt = format(new Date(payload.value.createdAt), "dd MMMM yyyy");
    const updatedAt = format(new Date(payload.value.updatedAt), "dd MMMM yyyy");
    return { createdAt, updatedAt };
  });

  const titleClass = computed(() => {
    switch (currentBenchmark) {
      case benchmarks.ACHIEVEMENTS:
        return "text-success-900";
      case benchmarks.CHALLENGES:
        return "text-neutral-grey-1300";
      case benchmarks.FAILURES:
        return "text-danger-900";
      case benchmarks.PROJECTS:
        return "text-neutral-grey-1300";
      default:
        return "text-neutral-grey-1000";
    }
  });

  const isDeleting = ref(false);
  const isPatching = ref(false);
  const isEditTitle = ref(false);
  const isEditDescription = ref(false);

  const currentIntent = computed(() => {
    if (isEditTitle.value) return intents.EDIT_TITLE;
    else if (isEditDescription.value) return intents.EDIT_DESCRIPTION;
  });

  const currentDataIndex = computed(
    () => injected.getResourceIndex(payload.value.slug) as number
  );

  function skip() {
    return {
      next: !!injected.data.value[currentDataIndex.value + 1]
        ? injected.data.value[currentDataIndex.value + 1]
        : payload.value,
      previous: !!injected.data.value[currentDataIndex.value - 1]
        ? injected.data.value[currentDataIndex.value - 1]
        : payload.value,
    };
  }
  async function goToPrevious() {
    const previous = skip().previous.slug;
    return await navigateTo({
      name: CURRENT_BENCHMARK,
      params: {
        orgSlug: stringifyRoute(route.params.orgSlug),
        positionSlug: stringifyRoute(route.params.positionSlug),
        benchmark: stringifyRoute(route.params.benchmark),
      },
      query: {
        v: previous,
      },
    });
  }
  async function goToNext() {
    const next = skip().next.slug;
    return await navigateTo({
      name: CURRENT_BENCHMARK,
      params: {
        orgSlug: stringifyRoute(route.params.orgSlug),
        positionSlug: stringifyRoute(route.params.positionSlug),
        benchmark: stringifyRoute(route.params.benchmark),
      },
      query: {
        v: next,
      },
    });
  }

  type PatchTarget = "title" | "description";
  function startPatching(target: PatchTarget) {
    isPatching.value = true;
    if (target === "title") isEditTitle.value = true;
    if (target === "description") isEditDescription.value = true;
  }
  function stopPatching(target: PatchTarget) {
    isPatching.value = false;
    if (target === "title") isEditTitle.value = false;
    if (target === "description") isEditDescription.value = false;
  }
  function optimisticUpdate(data: string, target: PatchTarget) {
    isPatching.value = false;
    if (target === "title") {
      isEditTitle.value = false;
      payload.value.title = data;
    }

    if (target === "description") {
      isEditDescription.value = false;
      payload.value.description = data;
    }
  }

  function preventClosingDropdown(event: Event) {
    if (width.value > 1024) event.preventDefault();
  }
</script>

<template>
  <div
    id="benchmark-container"
    class="px-3 h-full flex flex-col lg:grid lg:grid-cols-12 lg:grid-rows-[auto_1fr_minmax(0,0.4fr)] lg:gap-y-6"
  >
    <div class="w-full max-h-6 lg:contents">
      <button
        class="lg:col-start-1 lg:col-span-2 lg:self-start text-neutral-grey-1000"
        @click="
          async () =>
            await navigateTo({
              name: CURRENT_POSITION,
              params: {
                orgSlug: stringifyRoute(route.params.orgSlug),
                positionSlug: stringifyRoute(route.params.positionSlug),
              },
            })
        "
      >
        <LucideMoveLeftIcon :size="24" />
      </button>

      <ui-dialog
        :class="[
          isDeleting ? 'dialog-delete' : '',
          isEditTitle ? 'min-h-24' : '',
        ]"
      >
        <template #trigger="{ open }">
          <div
            class="hidden lg:block lg:col-span-2 lg:space-y-2 lg:justify-self-end"
            v-if="width > 1024"
          >
            <dropdown-menu-root>
              <dropdown-menu-trigger as-child>
                <ui-button
                  variant="neutral"
                  class="h-9 block pointer-events-auto"
                >
                  <lucide-pen-line-icon :size="20" />
                </ui-button>
              </dropdown-menu-trigger>
              <dropdown-menu-portal :to="'#benchmark-container'">
                <dropdown-menu-content
                  :side="'left'"
                  :side-offset="4"
                  class="min-w-24 min-h-12 px-3 py-[5px] bg-[#fff] rounded-md *:h-8 *:flex *:justify-start *:items-center *:text-sm *:text-neutral-grey-1000 *:cursor-pointer"
                >
                  <dropdown-menu-item
                    @select="
                      () => {
                        startPatching('title');
                        open();
                      }
                    "
                    >Edit title</dropdown-menu-item
                  >
                  <dropdown-menu-item
                    @select="
                      () => {
                        startPatching('description');
                        open();
                      }
                    "
                    >Edit description</dropdown-menu-item
                  >
                </dropdown-menu-content>
              </dropdown-menu-portal>
            </dropdown-menu-root>

            <ui-button
              variant="neutral"
              class="h-9 block pointer-events-auto"
              @click="
                () => {
                  isDeleting = true;
                  open();
                }
              "
            >
              <lucide-trash-2-icon :size="20" />
            </ui-button>
            <ui-button
              variant="neutral"
              class="h-9 block pointer-events-auto"
              @click="goToPrevious()"
            >
              <lucide-chevron-left-icon :size="20" />
            </ui-button>
            <ui-button
              variant="neutral"
              class="h-9 block pointer-events-auto"
              @click="goToNext()"
            >
              <lucide-chevron-right-icon :size="20" />
            </ui-button>
          </div>
          <dropdown-menu-root v-else>
            <dropdown-menu-trigger
              ref="trigger"
              class="float-right lg:float-none lg:col-span-2 lg:self-start lg:justify-self-end lg:flex lg:flex-col lg:gap-y-1.5"
            >
              <LucideEllipsisIcon
                :size="24"
                class="lg:h-0 lg:invisible lg:pointer-events-none"
              />
            </dropdown-menu-trigger>
            <dropdown-menu-portal :to="'#benchmark-container'">
              <dropdown-menu-content
                :align="'end'"
                :align-offset="0"
                class="lg:space-y-2 p-[5px] lg:*:p-0 lg:*:w-[44px] lg:*:h-9 min-w-28 min-h-16 bg-[#fff] lg:*:bg-[#fff] lg:bg-opacity-0 rounded-lg lg:*:rounded-md text-sm text-neutral-grey-1000 shadow-md lg:shadow-none"
                @interact-outside="preventClosingDropdown($event)"
              >
                <dropdown-menu-item
                  class="lg:hidden"
                  @select="
                    (e) => {
                      preventClosingDropdown(e);
                      startPatching('title');
                      open();
                    }
                  "
                  >Edit title</dropdown-menu-item
                >
                <dropdown-menu-item
                  class="lg:hidden"
                  @select="
                    (e) => {
                      preventClosingDropdown(e);
                      startPatching('description');
                      open();
                    }
                  "
                  >Edit description</dropdown-menu-item
                >
                <dropdown-menu-item
                  class="lg:hidden"
                  @select="
                    async (e) => {
                      preventClosingDropdown(e);
                      goToNext();
                    }
                  "
                  >Go to next</dropdown-menu-item
                >
                <dropdown-menu-item
                  class="lg:hidden"
                  @select="
                    async (e) => {
                      preventClosingDropdown(e);
                      goToPrevious();
                    }
                  "
                  >Go to previous</dropdown-menu-item
                >
                <dropdown-menu-item
                  class="lg:hidden text-danger-900"
                  @select="
                    (e) => {
                      preventClosingDropdown(e);
                      isDeleting = true;
                      open();
                    }
                  "
                  >Delete</dropdown-menu-item
                >
              </dropdown-menu-content>
            </dropdown-menu-portal>
          </dropdown-menu-root>
        </template>
        <template #default="{ close }">
          <visually-hidden>
            <dialog-title></dialog-title>
          </visually-hidden>
          <visually-hidden>
            <dialog-description></dialog-description>
          </visually-hidden>
          <lazy-app-form-patch
            :target="currentBenchmark"
            :intent="currentIntent"
            :data="{
              patchedSlug: payload.slug,
              benchmark: {
                title: payload.title,
                description: payload.description ?? '',
              },
            }"
            :parent-org="stringifyRoute(route.params.orgSlug)"
            :parent-position="stringifyRoute(route.params.positionSlug)"
            @cancel="
              () => {
                if (isEditTitle) stopPatching('title');
                else if (isEditDescription) stopPatching('description');
                close();
              }
            "
            @update:patch="
              (
                data:
                  | string
                  | Pick<SinglePos, 'monthStartedAt' | 'yearStartedAt'>,
                newSlug: string
              ) => {
                if (isEditTitle) {
                  optimisticUpdate(data as string, 'title');
                  payload.slug = newSlug;
                }

                if (isEditDescription)
                  optimisticUpdate(data as string, 'description');
                close();
              }
            "
            v-if="isPatching && !!currentIntent"
          />
          <lazy-app-form-delete
            :target="currentBenchmark"
            :data="payload.slug"
            :parent-org="stringifyRoute(route.params.orgSlug)"
            :parent-position="stringifyRoute(route.params.positionSlug)"
            @cancel="
              () => {
                isDeleting = false;
                close();
              }
            "
            @update:delete="
              async (data: string) => {
                isDeleting = false;
                injected.deleteBenchmark(data);
                await navigateTo({
                  name: CURRENT_POSITION,
                  params: {
                    orgSlug: stringifyRoute(route.params.orgSlug),
                    positionSlug: stringifyRoute(route.params.positionSlug),
                  },
                  query: {
                    benchmark: stringifyRoute(route.params.benchmark),
                  },
                });
                close();
              }
            "
            v-else-if="isDeleting"
          ></lazy-app-form-delete>
        </template>
      </ui-dialog>
    </div>

    <h1
      class="mt-4 lg:mt-0 lg:col-start-3 lg:row-start-1 lg:col-span-8 lg:max-w-[64rem] font-semibold text-lg"
      :class="[titleClass]"
    >
      {{ payload.title }}
    </h1>
    <p
      class="mt-4 lg:mt-0 lg:col-start-3 lg:col-span-8 lg:max-w-[64rem] flex-1 font-regular"
      :class="[
        payload.description
          ? 'text-neutral-grey-1300'
          : 'italic text-neutral-grey-900',
      ]"
    >
      {{ isDescriptionNotFound ? "No description found" : payload.description }}
    </p>
    <p
      class="lg:col-start-3 lg:col-span-8 lg:max-w-[64rem] font-regular text-sm text-neutral-grey-1000"
    >
      <span class="block">Created: {{ formattedDate.createdAt }}</span>
      <span class="block">Last modified: {{ formattedDate.updatedAt }}</span>
    </p>
  </div>
</template>
