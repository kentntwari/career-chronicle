export default defineNuxtPlugin((nuxtApp) => {
  const isFetchPositions = useState("isFetchPositions", () => false);

  return {
    provide: {
      isFetchPositions,
      fetchPositions: () => {
        isFetchPositions.value = true;
      },
      abortFetchPositions: () => {
        isFetchPositions.value = false;
      },
    },
  };
});
