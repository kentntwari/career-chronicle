<script lang="ts" setup>
  import type {
    Benchmark,
    BenchmarkPayload,
    ProvidedBenchmarks,
    SinglePos,
  } from "~/types";

  import { format } from "date-fns";

  import {
    MoveLeft as LucideMoveLeftIcon,
    Ellipsis as LucideEllipsisIcon,
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
</script>

<template>
  <div class="px-3 h-full flex flex-col lg:grid">
    <div class="w-full max-h-6 flex items-center justify-between">
      <button
        class="text-neutral-grey-1000"
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
          <dropdown-menu-root>
            <dropdown-menu-trigger>
              <LucideEllipsisIcon :size="24" />
            </dropdown-menu-trigger>
            <dropdown-menu-portal>
              <dropdown-menu-content
                :align="'end'"
                :align-offset="0"
                class="p-[5px] *:py-1.5 min-w-28 min-h-16 bg-[#fff] rounded-lg text-sm text-neutral-grey-1000 shadow-md"
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
                <dropdown-menu-item
                  @select="
                    async () => {
                      const next = skip().next.slug;
                      await navigateTo({
                        name: CURRENT_BENCHMARK,
                        params: {
                          orgSlug: stringifyRoute(route.params.orgSlug),
                          positionSlug: stringifyRoute(
                            route.params.positionSlug
                          ),
                          benchmark: stringifyRoute(route.params.benchmark),
                        },
                        query: {
                          v: next,
                        },
                      });
                    }
                  "
                  >Go to next</dropdown-menu-item
                >
                <dropdown-menu-item
                  @select="
                    async () => {
                      const previous = skip().previous.slug;
                      await navigateTo({
                        name: CURRENT_BENCHMARK,
                        params: {
                          orgSlug: stringifyRoute(route.params.orgSlug),
                          positionSlug: stringifyRoute(
                            route.params.positionSlug
                          ),
                          benchmark: stringifyRoute(route.params.benchmark),
                        },
                        query: {
                          v: previous,
                        },
                      });
                    }
                  "
                  >Go to previous</dropdown-menu-item
                >
                <dropdown-menu-item
                  class="text-danger-900"
                  @select="
                    () => {
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

    <h1 class="mt-4 font-semibold text-lg" :class="[titleClass]">
      {{ payload.title }}
    </h1>
    <p
      class="mt-4 flex-1 font-regular"
      :class="[
        payload.description
          ? 'text-neutral-grey-1300'
          : 'italic text-neutral-grey-900',
      ]"
    >
      {{ payload.description ?? "No description found" }}
    </p>
    <p class="font-regular text-sm text-neutral-grey-1000">
      <span class="block">Created: {{ formattedDate.createdAt }}</span>
      <span class="block">Last modified: {{ formattedDate.updatedAt }}</span>
    </p>
  </div>
</template>
