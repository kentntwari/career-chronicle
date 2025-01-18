import { BenchmarkPayload, type Benchmark, type Benchmarks } from "~/types";

import { redis } from "~/lib/redis";
import * as authorize from "@/server/utils/authorize";
import * as benchmarks from "~/constants/benchmarks";
import { validateParams } from "~/server/utils/params";
import { resolveUserPosBenchmark } from "~/utils/keys";
import {
  patchBenchmark as patchDbBenchmark,
  loadBenchmark as loadDbBenchmark,
} from "~/server/utils/db";

export default defineEventHandler(async (event) => {
  try {
    const { kinde } = await allowAuthorizedKindeUser(event);
    const { permissions } = await kinde.getPermissions();
    authorize.hasPermissions(
      permissions as authorize.Permissions,
      "update:benchmark"
    );

    const user = await kinde.getUser();

    const orgSlug = validateParams(event, "organization");
    const positionSlug = validateParams(event, "position");
    const benchmarkCategory = validateParams(event, "benchmark");

    const submitted = await validateSubmission(
      event,
      benchmarkCategory as Benchmark & (typeof benchmarks)["PROJECTS"],
      "PATCH"
    );

    if (!submitted.benchmark) return;

    const p = redis.pipeline();

    const DEFAULT_CURRENT_RESOURCE_ARGS = [
      user.email,
      orgSlug,
      positionSlug,
      benchmarkCategory,
      submitted.slug.current.toLocaleLowerCase(),
    ] as const;
    const DEFAULT_NEW_RESOURCE_ARGS = [
      user.email,
      orgSlug,
      positionSlug,
      benchmarkCategory,
      submitted.slug.new.toLocaleLowerCase(),
    ] as const;
    const DEFAULT_ARR_RESOURCE_ARGS = [
      user.email,
      orgSlug,
      positionSlug,
      benchmarkCategory,
    ] as const;

    const UPDATE_TITLE_ARGS = [
      orgSlug,
      positionSlug,
      benchmarkCategory,
      submitted.slug.current,
      {
        title: submitted.benchmark.title ?? undefined,
        slug: submitted.benchmark.title ? submitted.slug.new : undefined,
      },
    ] as Parameters<typeof patchDbBenchmark>;
    const UPDATE_DESC_ARGS = [
      orgSlug,
      positionSlug,
      benchmarkCategory,
      submitted.slug.current,
      {
        description: submitted.benchmark.description,
      },
    ] as Parameters<typeof patchDbBenchmark>;
    const UPDATE_PROJECT_TIMELINE_ARGS = [
      orgSlug,
      positionSlug,
      benchmarkCategory,
      submitted.slug.current,
      {
        monthStartedAt: !!submitted.benchmark.projectTimeline
          ? submitted.benchmark.projectTimeline.month.toUpperCase()
          : undefined,
        yearStartedAt: !!submitted.benchmark.projectTimeline
          ? submitted.benchmark.projectTimeline.year
          : undefined,
      },
    ] as Parameters<typeof patchDbBenchmark>;
    const UPDATE_BENCHMARK_TIMELINE_ARGS = [
      orgSlug,
      positionSlug,
      benchmarkCategory,
      submitted.slug.current,
      {
        monthOccuredAt: !!submitted.benchmark.generalTimeline
          ? submitted.benchmark.generalTimeline.month.toUpperCase()
          : undefined,
        yearStartedAt: !!submitted.benchmark.generalTimeline
          ? submitted.benchmark.generalTimeline.year
          : undefined,
      },
    ] as Parameters<typeof patchDbBenchmark>;

    let redis_arr: Benchmarks = [];
    let redis_arr_resource: Benchmarks[number] | null | undefined;
    let redis_resource: Benchmarks[number] | null | undefined;
    let db_resource: Benchmarks[number] | null | undefined;
    let db_benchmark_payload: BenchmarkPayload | null | undefined;

    redis_arr = (await redis.lrange<Benchmarks[number]>(
      resolveUserPosBenchmark(...DEFAULT_ARR_RESOURCE_ARGS),
      0,
      -1
    )) as Benchmarks;
    redis_resource = await redis.hgetall<Benchmarks[number]>(
      getSingleResourceCacheKey(...DEFAULT_CURRENT_RESOURCE_ARGS)
    );
    redis_arr_resource = redis_arr.find(
      (b) => b.slug === submitted.slug.current
    );

    if (!redis_arr_resource && !redis_resource)
      db_benchmark_payload = await loadDbBenchmark(
        orgSlug,
        positionSlug,
        benchmarkCategory,
        submitted.slug.current
      );

    if (!redis_arr_resource && !redis_resource && !db_benchmark_payload) return;

    if (!redis_arr_resource && !redis_resource && db_benchmark_payload)
      db_resource =
        benchmarkCategory !== benchmarks.PROJECTS
          ? {
              title: db_benchmark_payload.title,
              slug: db_benchmark_payload.slug,
              monthOccuredAt:
                "monthOccuredAt" in db_benchmark_payload
                  ? db_benchmark_payload.monthOccuredAt
                  : null,
              yearOccuredAt:
                "yearOccuredAt" in db_benchmark_payload
                  ? db_benchmark_payload.yearOccuredAt
                  : null,
              createdAt: db_benchmark_payload.createdAt,
              updatedAt: db_benchmark_payload.updatedAt,
            }
          : {
              title: db_benchmark_payload.title,
              slug: db_benchmark_payload.slug,
              monthStartedAt:
                "monthStartedAt" in db_benchmark_payload
                  ? db_benchmark_payload.monthStartedAt
                  : null,
              yearStartedAt:
                "yearStartedAt" in db_benchmark_payload
                  ? db_benchmark_payload.yearStartedAt
                  : null,
              createdAt: db_benchmark_payload.createdAt,
              updatedAt: db_benchmark_payload.updatedAt,
            };

    let updateTitleAndSlug: { title: string; slug: string } = {
      title:
        submitted.benchmark.title ??
        redis_resource?.title ??
        redis_arr_resource?.title ??
        db_resource?.title ??
        "",
      slug:
        submitted.slug.new ??
        redis_arr_resource?.slug ??
        redis_resource?.slug ??
        db_resource?.slug ??
        "",
    };

    let updateTimestamp: { createdAt: Date; updatedAt: Date } = {
      createdAt:
        redis_resource?.createdAt ?? redis_arr_resource?.createdAt ?? NOW,
      updatedAt: NOW,
    };

    if (redis_arr_resource)
      p.lrem<Benchmarks[number]>(
        resolveUserPosBenchmark(...DEFAULT_ARR_RESOURCE_ARGS),
        0,
        { ...redis_arr_resource }
      );

    if (redis_arr_resource && benchmarkCategory === benchmarks.PROJECTS)
      p.rpush<Benchmarks[number]>(
        resolveUserPosBenchmark(...DEFAULT_ARR_RESOURCE_ARGS),
        {
          ...updateTitleAndSlug,
          ...updateTimestamp,
          monthStartedAt:
            "monthStartedAt" in redis_arr_resource
              ? redis_arr_resource.monthStartedAt
              : null,
          yearStartedAt:
            "yearStartedAt" in redis_arr_resource
              ? redis_arr_resource.yearStartedAt
              : null,
        }
      );

    if (redis_arr_resource && benchmarkCategory !== benchmarks.PROJECTS)
      p.rpush<Benchmarks[number]>(
        resolveUserPosBenchmark(...DEFAULT_ARR_RESOURCE_ARGS),
        {
          ...updateTitleAndSlug,
          ...updateTimestamp,
          monthOccuredAt:
            "monthOccuredAt" in redis_arr_resource
              ? redis_arr_resource.monthOccuredAt
              : null,
          yearOccuredAt:
            "yearOccuredAt" in redis_arr_resource
              ? redis_arr_resource.yearOccuredAt
              : null,
        }
      );

    if (
      !redis_arr_resource &&
      redis_resource &&
      benchmarkCategory !== benchmarks.PROJECTS
    )
      p.rpush<Benchmarks[number]>(
        resolveUserPosBenchmark(...DEFAULT_ARR_RESOURCE_ARGS),
        {
          ...updateTitleAndSlug,
          ...updateTimestamp,
          monthOccuredAt:
            "monthOccuredAt" in redis_resource
              ? redis_resource.monthOccuredAt
              : null,
          yearOccuredAt:
            "yearOccuredAt" in redis_resource
              ? redis_resource.yearOccuredAt
              : null,
        }
      );

    if (
      !redis_arr_resource &&
      !redis_resource &&
      db_resource &&
      benchmarkCategory === benchmarks.PROJECTS
    )
      p.rpush<Benchmarks[number]>(
        resolveUserPosBenchmark(...DEFAULT_ARR_RESOURCE_ARGS),
        {
          ...updateTitleAndSlug,
          ...updateTimestamp,
          monthStartedAt:
            "monthStartedAt" in db_resource ? db_resource.monthStartedAt : null,
          yearStartedAt:
            "yearStartedAt" in db_resource ? db_resource.yearStartedAt : null,
        }
      );

    if (db_resource && benchmarkCategory !== benchmarks.PROJECTS)
      p.rpush<Benchmarks[number]>(
        resolveUserPosBenchmark(...DEFAULT_ARR_RESOURCE_ARGS),
        {
          ...updateTitleAndSlug,
          ...updateTimestamp,
          monthOccuredAt:
            "monthOccuredAt" in db_resource ? db_resource.monthOccuredAt : null,
          yearOccuredAt:
            "yearOccuredAt" in db_resource ? db_resource.yearOccuredAt : null,
        }
      );

    if (db_resource && benchmarkCategory === benchmarks.PROJECTS)
      p.rpush<Benchmarks[number]>(
        resolveUserPosBenchmark(...DEFAULT_ARR_RESOURCE_ARGS),
        {
          ...updateTitleAndSlug,
          ...updateTimestamp,
          monthStartedAt:
            "monthStartedAt" in db_resource ? db_resource.monthStartedAt : null,
          yearStartedAt:
            "yearStartedAt" in db_resource ? db_resource.yearStartedAt : null,
        }
      );

    switch (true) {
      case !!submitted.benchmark.title:
        {
          p.del(getSingleResourceCacheKey(...DEFAULT_CURRENT_RESOURCE_ARGS));
          if (updateTitleAndSlug.title !== "" && updateTitleAndSlug.slug !== "")
            p.hset(getSingleResourceCacheKey(...DEFAULT_NEW_RESOURCE_ARGS), {
              ...updateTitleAndSlug,
              ...updateTimestamp,
            });
        }
        break;
      case !!submitted.benchmark.description:
        p.hset(getSingleResourceCacheKey(...DEFAULT_CURRENT_RESOURCE_ARGS), {
          ...updateTimestamp,
          description: submitted.benchmark.description,
        });
        break;
      case !!submitted.benchmark.projectTimeline &&
        benchmarkCategory === benchmarks.PROJECTS:
        p.hset(getSingleResourceCacheKey(...DEFAULT_CURRENT_RESOURCE_ARGS), {
          ...updateTimestamp,
          monthStartedAt:
            submitted.benchmark.projectTimeline.month.toUpperCase(),
          yearStartedAt: submitted.benchmark.projectTimeline.year,
        });
        break;

      case !!submitted.benchmark.generalTimeline &&
        benchmarkCategory !== benchmarks.PROJECTS:
        p.hset(getSingleResourceCacheKey(...DEFAULT_CURRENT_RESOURCE_ARGS), {
          ...updateTimestamp,
          monthOccuredAt:
            submitted.benchmark.generalTimeline.month.toUpperCase(),
          yearOccuredAt: submitted.benchmark.generalTimeline.year,
        });
        break;

      default:
        throw createError({
          statusCode: 400,
          statusMessage: "Unrecognized submission",
        });
    }

    // TODO: Must achieve data consistency between redis and db
    // TODO: perhaps consider transaction or rollback mechanism
    await Promise.all([
      p.exec(),
      !!submitted.benchmark.title && submitted.benchmark.title !== ""
        ? patchDbBenchmark(...UPDATE_TITLE_ARGS)
        : null,
      !!submitted.benchmark.description
        ? patchDbBenchmark(...UPDATE_DESC_ARGS)
        : null,
      !!submitted.benchmark.projectTimeline
        ? patchDbBenchmark(...UPDATE_PROJECT_TIMELINE_ARGS)
        : null,
      !!submitted.benchmark.generalTimeline
        ? patchDbBenchmark(...UPDATE_BENCHMARK_TIMELINE_ARGS)
        : null,
    ]);
    return;
  } catch (error) {
    console.log(error);
    throwError(error);
  }
});
