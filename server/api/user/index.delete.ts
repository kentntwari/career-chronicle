import { redis } from "@/lib/redis";
import { deleteUser } from "~/server/utils/db";

export default defineEventHandler(async (event) => {
  try {
    const { kinde } = await allowAuthorizedKindeUser(event);

    const user = await kinde.getUser();

    const nitroApp = useNitroApp();
    const t: string = await nitroApp.hooks.callHook(
      "retrieve:kinde-access-token",
      user.email
    );

    const p = redis.pipeline();

    const keys = await redis.keys(`*user:${user.email.toLocaleLowerCase()}*`);
    if (keys.length) p.del(...keys);

    await Promise.all([
      p.exec(),

      deleteUser({ id: user.id, email: user.email }),
    ]);

    $fetch("/api/v1/user", {
      method: "DELETE",
      baseURL: process.env.NUXT_KINDE_M2M_DOMAIN,
      query: {
        id: user.id,
      },
      headers: {
        Authorization: `Bearer ${t}`,
      },
    });

    return;
  } catch (error) {
    console.log(error);
    throwError(error);
  }
});
