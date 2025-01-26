<script lang="ts" setup>
  import type { OrgPos } from "~/types";

  import months from "~/constants/months";
  import * as intents from "~/constants/intents";

  definePageMeta({
    middleware: ["protected"],
    layout: false,
  });

  const positions = inject<Readonly<Ref<OrgPos>>>(
    resolveProvidedKeys().positions.all,
    () => ref([]),
    true
  );

  const route = useRoute();
  const router = useRouter();

  const cachedPositions = useNuxtData<OrgPos>(
    resolveOrgPositions(stringifyRoute(route.params.orgSlug))
  );

  const accYears = computed(() => {
    if (!positions) return [];
    const years = positions.value.map(({ yearStartedAt: year }) =>
      year.toString()
    );
    return [...new Set(years)];
  });

  const isDelete = ref(false);
  const isEdit = ref(false);
  const currentPosition = ref<OrgPos[number]>();

  function deletePosition(currentSlug: string) {
    isDelete.value = true;
    currentPosition.value = positions.value.find(
      ({ slug }) => slug === currentSlug
    );
  }
  function patchPosition(currentSlug: string) {
    isEdit.value = true;
    currentPosition.value = positions.value.find(
      ({ slug }) => slug === currentSlug
    );
  }

  function pushPosition(newPosition: OrgPos[number]) {
    if (!!cachedPositions.data.value)
      cachedPositions.data.value.push(newPosition);
    else cachedPositions.data.value = [newPosition];
  }
</script>

<template>
  <main>
    <section class="container">
      <div class="w-full mt-4 xl:mt-6 px-3 container">
        <app-data-plan-banner
          :target="'POSITIONS'"
          :current-count="positions.length"
          class="mb-14 xl:mb-[7.5rem]"
        />

        <p v-if="positions.length === 0">No positions found</p>

        <template v-else>
          <section
            class="xl:nested-container min-h-9 h-fit xl:h-[50px] border-b border-neutral-grey-600"
            :class="[route.query.organize ? 'pb-6' : '']"
          >
            <h1 class="font-bold text-md xl:text-xl">
              Positions
              <span class="inherit" v-show="!route.query.organize">
                ({{ positions.length }})
              </span>
              <span class="inherit" v-show="route.query.organize"
                >held in
                <div class="inline-flex gap-3">
                  <ui-select
                    :key="route.fullPath"
                    :default="
                      route.query.month ? route.query.month.toString() : ''
                    "
                    :items="months"
                    :classes="{
                      trigger: 'bg-[#fff] font-medium text-sm',
                    }"
                    :placeholder="'Select month'"
                    @update:selected="
                      (month) =>
                        router.push({
                          query: {
                            ...route.query,
                            month,
                          },
                        })
                    "
                  />
                  <ui-select
                    :key="route.fullPath"
                    :default="
                      route.query.year ? route.query.year.toString() : ''
                    "
                    :items="accYears"
                    :classes="{
                      trigger: 'bg-[#fff] font-medium text-sm',
                    }"
                    :placeholder="'Select year'"
                    @update:selected="
                      (year) =>
                        router.push({
                          query: {
                            ...route.query,
                            year,
                          },
                        })
                    "
                  />
                </div>
              </span>
            </h1>
          </section>
          <div class="xl:nested-container mt-6 space-y-8">
            <div class="min-h-40 flex flex-col gap-4">
              <ui-dialog class="dialog-delete">
                <template #trigger="{ open }">
                  <app-data-position-snippet
                    v-for="position in positions"
                    :data="position"
                    :key="position.slug"
                    :parent-organization="stringifyRoute(route.params.orgSlug)"
                    @edit="
                      () => {
                        patchPosition(position.slug);
                        open();
                      }
                    "
                    @delete="
                      () => {
                        deletePosition(position.slug);
                        open();
                      }
                    "
                  />
                </template>
                <template #default="{ close }">
                  <visually-hidden>
                    <dialog-title></dialog-title>
                  </visually-hidden>
                  <visually-hidden
                    ><dialog-description></dialog-description
                  ></visually-hidden>
                  <lazy-app-form-patch
                    :data="{
                      patchedSlug: currentPosition.slug,
                      position: {
                        title: currentPosition.title,
                        timeline: {
                          month: currentPosition.monthStartedAt,
                          year: currentPosition.yearStartedAt,
                        },
                      },
                    }"
                    :intent="intents.EDIT_TITLE"
                    :target="'POSITION'"
                    :parent-org="stringifyRoute(route.params.orgSlug)"
                    @update:patch="
                      () => {
                        isEdit = false;
                        close();
                      }
                    "
                    @cancel="
                      () => {
                        isEdit = false;
                        close();
                      }
                    "
                    v-if="isEdit && !!currentPosition"
                  />
                  <lazy-app-form-delete
                    :data="currentPosition.slug"
                    :target="'POSITION'"
                    :parent-org="stringifyRoute(route.params.orgSlug)"
                    @cancel="
                      () => {
                        isDelete = false;
                        close();
                      }
                    "
                    @update:delete="
                      () => {
                        isDelete = false;
                        close();
                      }
                    "
                    v-else-if="isDelete && !!currentPosition"
                  />
                </template>
              </ui-dialog>
            </div>
          </div>
        </template>
        <div
          class="xl:nested-container flex flex-col-reverse items-start gap-y-6"
        >
          <ui-button
            :variant="'link'"
            :size="'link'"
            @click="
              !route.query.organize
                ? router.push({
                    query: {
                      organize: 'true',
                    },
                  })
                : router.push({
                    query: {},
                  })
            "
            v-show="positions.length > 0"
            >{{ !route.query.organize ? "Organize" : "Unorganize" }} by year and
            month
          </ui-button>
          <ui-dialog>
            <template #trigger="{ open: createPosition }">
              <app-create-position-btn
                :data="positions"
                :variant="'link'"
                :size="'link'"
                @create="createPosition()"
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
              <ui-toast
                type="error"
                title="Something went wrong"
                v-slot="{ triggerToast }"
              >
                <app-form-position
                  :parent-organization="stringifyRoute(route.params.orgSlug)"
                  @cancel="close()"
                  @form-submitted="
                    (data: OrgPos[number]) => {
                      pushPosition(data);
                      close();
                    }
                  "
                />
              </ui-toast>
            </template>
          </ui-dialog>
        </div>
      </div>
    </section>
  </main>
</template>
