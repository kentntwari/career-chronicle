import { useTimeoutFn } from "@vueuse/core";

export function useDelayedLoading(minimumLoadingTime = 1000) {
  const isLoading = ref(false);
  const timeoutHandler = ref();

  const startLoading = () => {
    isLoading.value = true;
  };

  const stopLoading = () => {
    const { start } = useTimeoutFn(() => {
      isLoading.value = false;
    }, minimumLoadingTime);

    timeoutHandler.value = start();
  };

  onUnmounted(() => {
    if (timeoutHandler.value) {
      clearTimeout(timeoutHandler.value);
    }
  });

  return {
    isLoading,
    startLoading,
    stopLoading,
  };
}
