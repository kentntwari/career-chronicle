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

export function useBenchmarkKey() {
  const route = useRoute();
  const b = useState();

  return computed(() => {
    return ("pos:" +
      route.params.positionSlug +
      ":" +
      route.query.benchmark) as string;
  });
}
