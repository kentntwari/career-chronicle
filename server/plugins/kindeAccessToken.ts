import type { UserType } from "@kinde-oss/kinde-typescript-sdk";
import type { KindeAccessToken } from "~/types";

import { redis } from "~/lib/redis";
import { resolveUserAccessToken } from "~/utils/keys";

declare module "nitropack" {
  interface NitroRuntimeHooks {
    "retrieve:kinde-access-token": (userEmail: string) => void;
  }
}
// FIX: clean up logic because this is brute-forced
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook(
    "retrieve:kinde-access-token",
    async (userEmail: UserType["email"]) => {
      try {
        const cached = await redis.hgetall<{ value: string; exp: number }>(
          resolveUserAccessToken(userEmail)
        );

        const p = redis.pipeline();

        if (!cached) {
          const t = await $fetch<KindeAccessToken>("oauth2/token", {
            method: "POST",
            baseURL: process.env.NUXT_KINDE_M2M_DOMAIN!,
            body: new URLSearchParams({
              client_id: process.env.NUXT_KINDE_M2M_CLIENT_ID!,
              client_secret: process.env.NUXT_KINDE_M2M_CLIENT_SECRET!,
              audience: process.env.NUXT_KINDE_M2M_AUDIENCE!,
              grant_type: "client_credentials",
            }),
          });

          p.hset(resolveUserAccessToken(userEmail), {
            value: t.access_token,
            exp: t.expires_in,
          });
          p.expire(resolveUserAccessToken(userEmail), t.expires_in);
          await p.exec();

          return t.access_token;
        }

        return cached.value;
      } catch (error) {
        console.log(error);
        throwError(error);
      }
    }
  );
});
