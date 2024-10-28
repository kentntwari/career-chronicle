import { z } from "zod";

export const newOrg = z.object({
  name: z
    .string({
      message: "Must be at least 1 character and max. 150 characters",
    })
    .min(1, { message: "Must be at least 1 character" })
    .max(150, { message: "Must not exceed 150 characters" }),
});

export const incomingNewOrgBody = newOrg.extend({
  slug: z.string(),
});

export const apiFetchedOrgs = z
  .array(
    z.object({
      name: z.string(),
      slug: z.string(),
    })
  )
  .nullish();

export const cachedOrgs = z.array(
  z.object({
    name: z.string(),
    slug: z.string(),
  })
);

export const userPlan = z.enum(["FREE", "PRO"]);
