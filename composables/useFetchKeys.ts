export function useOrganizationKey() {
  const route = useRoute();
  return computed(() => "org:" + route.params.orgSlug);
}

export function useOrgPositionsKey() {
  const route = useRoute();
  return computed(() => "org:" + route.params.orgSlug + ":positions");
}

export function useCurrentPositionKey() {
  const route = useRoute();
  return computed(() => "pos:" + route.params.positionSlug);
}
