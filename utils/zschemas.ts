import { z } from "zod";
import { getYear } from "date-fns";

export const userCredentialsSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});

export const newOrg = z.object({
  name: z
    .string({
      message: "Must be at least 1 character and max. 150 characters",
    })
    .min(1, { message: "Must be at least 1 character" })
    .max(150, { message: "Must not exceed 150 characters" }),
});

export const newPosition = z.object({
  title: z
    .string()
    .min(5, { message: "Must be at least 5 characters" })
    .max(150, { message: "Must not exceed 150 characters" }),
  description: z.optional(
    z.string().max(500, { message: "Must not exceed 500 characters" })
  ),
  tenure: z.object({
    month: z
      .string({ required_error: "Must select a month" })
      .superRefine((val, ctx) => {
        if (!memoizedMonthArray().includes(val))
          ctx.addIssue({
            code: "custom",
            message: "Must be a valid month",
          });
      }),
    year: z
      .number({ message: "Must be between 1950 and " + getYear(new Date()) })
      .min(1950, { message: "The earliest can only be 1950" })
      .max(getYear(new Date()), {
        message: "The latest can only be " + getYear(new Date()),
      }),
  }),
});

export const incomingNewOrgBody = newOrg.extend({
  slug: z.string(),
});

export const incomingNewPositionBody = newPosition.extend({
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
