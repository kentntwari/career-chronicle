export function useMatchOrganizationPath() {
  const route = useRoute();

  const isOrganizationPath = computed(() =>
    /\/organization\/[\w-]+$/.test(route.path)
  );

  return isOrganizationPath;
}
