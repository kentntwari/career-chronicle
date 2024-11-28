export async function openNewTab(url: string) {
  return await navigateTo(encodeURI(url), {
    open: {
      target: "_blank",
    },
  });
}
