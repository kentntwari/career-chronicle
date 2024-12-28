import { z } from "zod";
import { getYear } from "date-fns";
import months from "~/constants/months";
import * as benchmarks from "~/constants/benchmarks";

export const userCredentials = z.object({
  id: z.string(),
  email: z.string().email(),
});

export const deleteSchema = z.object({
  slug: z.string(),
  parentOrg: z
    .object({
      slug: z.string(),
    })
    .optional(),
  parentPosition: z
    .object({
      slug: z.string(),
    })
    .optional(),
});

export const newOrg = z.object({
  name: z
    .string({
      message: "Must be at least 1 character and max. 150 characters",
    })
    .min(1, { message: "Must be at least 1 character" })
    .max(150, { message: "Must not exceed 150 characters" }),
});

export const newTimelineMarker = z.object({
  title: z
    .string()
    .min(5, { message: "Must be at least 5 characters" })
    .max(150, { message: "Must not exceed 150 characters" }),
  description: z.optional(
    z.string().max(500, { message: "Must not exceed 500 characters" })
  ),
  timeline: z.object({
    month: z
      .string({ required_error: "Must select a month" })
      .transform((val) => val.toLocaleUpperCase())
      .superRefine((val, ctx) => {
        if (!months.map((m) => m.toUpperCase()).includes(val))
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

export const newProject = newTimelineMarker
  .omit({
    timeline: true,
  })
  .extend({
    timeline: z.object({
      month: z
        .string({ required_error: "Must select a month" })
        .transform((val) => val.toLocaleUpperCase())
        .superRefine((val, ctx) => {
          if (!months.map((m) => m.toUpperCase()).includes(val))
            ctx.addIssue({
              code: "custom",
              message: "Must be a valid month",
            });
        }),
      year: z
        .number({
          message:
            "Must be between " +
            getYear(new Date()) +
            " and " +
            (getYear(new Date()) + 50),
        })
        .min(getYear(new Date()), { message: "Cannot be in the past" })
        .max(getYear(new Date()) + 50, {
          message: "Must not exceed 50 years from now",
        }),
    }),
  });

export const incomingNewOrgBody = newOrg.extend({
  slug: z.string(),
});

export const incomingNewTimelineMarkerBody = newTimelineMarker.extend({
  slug: z.string(),
});

export const incomingNewProjectBody = newProject.extend({
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

export const organizePositionsByMonth = z
  .string()
  .nullish()
  .superRefine((val, ctx) => {
    if (!val)
      return ctx.addIssue({
        code: "custom",
        message: "cannot be empty",
      });

    if (!months.map((m) => m.toUpperCase()).includes(val.toUpperCase()))
      ctx.addIssue({
        code: "custom",
        message: "Must be a valid month",
      });
  });

export const organizePositionsByYear = z
  .number()
  .min(1950, { message: "The earliest can only be 1950" })
  .max(getYear(new Date()), {
    message: "The latest can only be " + getYear(new Date()),
  });

export const queryByMonthOrYear = z.object({
  month: z.preprocess(
    (val) => {
      if (typeof val === "string" && val !== "") return val.toUpperCase();
      return null;
    },
    z
      .union([
        z.literal("JANUARY"),
        z.literal("FEBRUARY"),
        z.literal("MARCH"),
        z.literal("APRIL"),
        z.literal("MAY"),
        z.literal("JUNE"),
        z.literal("JULY"),
        z.literal("AUGUST"),
        z.literal("SEPTEMBER"),
        z.literal("OCTOBER"),
        z.literal("NOVEMBER"),
        z.literal("DECEMBER"),
      ])
      .nullish()
  ),
  year: z
    .string()
    .superRefine((val, ctx) => {
      if (!val) return;
      const year = parseInt(val);
      if (isNaN(year))
        return ctx.addIssue({
          code: "custom",
          message: "Must be a valid year",
        });
      if (year < 1950 || year > getYear(new Date()))
        return ctx.addIssue({
          code: "custom",
          message: "Must be between 1950 and " + getYear(new Date()),
        });
    })
    .transform((val) => {
      if (!val) return null;
      return parseInt(val);
    }),
});

export const queriedBenchmark = z.preprocess(
  (val) => {
    if (typeof val === "string" && val !== "") return val.toLocaleUpperCase();
    return benchmarks.ACHIEVEMENTS;
  },
  z.union([
    z.literal(benchmarks.ACHIEVEMENTS),
    z.literal(benchmarks.PROJECTS),
    z.literal(benchmarks.FAILURES),
    z.literal(benchmarks.CHALLENGES),
  ])
);
