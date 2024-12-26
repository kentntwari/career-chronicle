<script lang="ts" setup>
  import type { OrgPos } from "~/types";
  import months from "~/constants/months";

  definePageMeta({
    middleware: ["protected"],
    layout: false,
  });

  const positions = inject<Ref<OrgPos>>(
    resolveProvidedKeys().positions.all,
    () => ref([]),
    true
  );

  const pk = useOrgPositionsKey();
  const cachedPositions = useNuxtData<OrgPos>(pk.value);

  const route = useRoute();
  const router = useRouter();

  const accYears = computed(() => {
    if (!positions) return [];
    const years = positions.value.map(({ yearStartedAt: year }) =>
      year.toString()
    );
    return [...new Set(years)];
  });

  function pushPosition(newPosition: OrgPos[number]) {
    if (!!cachedPositions.data.value)
      cachedPositions.data.value.push(newPosition);
    else cachedPositions.data.value = [newPosition];
  }
</script>

<template>
  <main>
    <section class="container">
      <div class="w-full mt-4 px-3 container">
        <app-data-plan-banner
          :target="'POSITIONS'"
          :current-count="positions.length"
          class="mb-14"
        />

        <p v-if="positions.length === 0">No positions found</p>

        <template v-else>
          <section
            class="min-h-9 h-fit border-b border-neutral-grey-600"
            :class="[route.query.organize ? 'pb-6' : '']"
          >
            <h1 class="font-bold text-md">
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
          <div class="mt-6 space-y-8">
            <div class="min-h-40 flex flex-col gap-4">
              <template v-if="!route.query.organize">
                <app-data-position-snippet
                  v-for="position in positions"
                  :data="position"
                  :key="position.slug"
                  :parent-organization="stringifyRoute(route.params.orgSlug)"
                />
              </template>

              <app-data-positions-organized :initial="positions" v-else>
                <template #default="{ organizedData }">
                  <app-data-position-snippet
                    v-for="position in organizedData"
                    :data="position"
                    :key="position.slug"
                    :parent-organization="stringifyRoute(route.params.orgSlug)"
                  />
                </template>
              </app-data-positions-organized>
            </div>

            <div class="flex flex-col-reverse items-start gap-y-6">
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
                >{{ !route.query.organize ? "Organize" : "Unorganize" }} by year
                and month</ui-button
              >
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
                      :parent-organization="
                        stringifyRoute(route.params.orgSlug)
                      "
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
        </template>
      </div>
    </section>
  </main>
</template>
