import { checkExistingDbUser } from "~/server/utils/db";
import { resolveUser } from "~/utils/keys";

// TODO: Might have to set httOnly to true
// for now it's fine since it's just for client side purposes
const COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 30,
  secure: true,
  // httpOnly: true,
  sameSite: "strict",
} as const;

const COOKIE_NAME = "isFirstTime";
const KV_STORE = "data";

export default defineEventHandler(async (event) => {
  try {
    const { kinde } = await allowAuthorizedKindeUser(event);

    //  check kv store
    const storage = useStorage(KV_STORE);
    const user = await kinde.getUser();
    const isFirstTimeUser = await storage.getItem<boolean>(
      resolveUser(user.email)
    );

    // check if user ever existed
    if (isFirstTimeUser === null) {
      const isExistingUser = await checkExistingDbUser({
        id: user.id,
        email: user.email,
      });

      switch (true) {
        case isExistingUser:
          await storage.setItem(resolveUser(user.email), "false");
          setCookie(event, COOKIE_NAME, "false", COOKIE_OPTIONS);
          return null;

        default:
          await storage.setItem(resolveUser(user.email), "true");
          setCookie(event, COOKIE_NAME, "true", COOKIE_OPTIONS);
          return null;
      }
    }
    setCookie(event, COOKIE_NAME, isFirstTimeUser.toString(), COOKIE_OPTIONS);
    return null;
  } catch (error) {
    throwError(error);
  }
});
