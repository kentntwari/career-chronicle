<script lang="ts" setup>
  useHead({
    htmlAttrs: { class: "bg-site" },
  });
</script>

<template>
  <div class="min-h-screen min-h-[100dvh] flex flex-col">
    <ui-dialog class="min-h-56 grid">
      <template #trigger="{ open }">
        <app-navigation @update:delete-account="open()" />
      </template>
      <template #default="{ close }">
        <app-form-delete
          :data="'delete-account'"
          target="ACCOUNT"
          @cancel="close()"
        >
          <div class="space-y-2">
            <p class="font-semibold text-lg text-danger-900">Warning</p>
            <span class="block text-neutral-grey-1000"
              >This is an irreversible action that will result in the permanent
              deletion of your account from our servers and the loss of your
              data</span
            >
          </div>
        </app-form-delete>
      </template>
    </ui-dialog>
    <div class="flex-1 flex flex-col">
      <slot />
    </div>
  </div>
</template>
