import type { H3Event } from "h3";
import type { KindeContext } from "@/types";

export async function allowAuthorizedKindeUser(event: H3Event) {
  const kinde = (await event.context.kinde) as KindeContext;

  if (!kinde || !kinde.isAuthenticated()) {
    throw createError({
      statusCode: 401,
      statusMessage: "Not a user",
    });
  }

  return { kinde };
}
