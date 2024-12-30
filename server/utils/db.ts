import { Month, Prisma, Tier } from "@prisma/client";
import { Benchmark, BenchmarkPayload } from "~/types";

import { z } from "zod";

import { prisma } from "@/lib/prisma";

import * as benchmarks from "~/constants/benchmarks";
import {
  userCredentials,
  incomingNewTimelineMarkerBody,
  queriedBenchmark,
  incomingNewProjectBody,
} from "~/utils/zschemas";

type UserCredentials = z.infer<typeof userCredentials>;

function findExistingUser(user: UserCredentials) {
  return prisma.user.findUnique({
    where: {
      id: user.id,
      email: user.email,
    },
    select: {
      id: true,
      email: true,
      plan: true,
    },
  });
}

export async function checkExistingDbUser(user: UserCredentials) {
  try {
    const dbUser = await findExistingUser(user);
    if (!dbUser) return false;
    return true;
  } catch (error) {
    logAndThrow(error);
  }
}

export async function deleteUser(user: UserCredentials) {
  try {
    const currentUser = await findExistingUser(user);
    if (!currentUser) return;
    await prisma.user.delete({
      where: {
        id: currentUser.id,
      },
    });
    return;
  } catch (error) {
    logAndThrow(error);
  }
}

export async function findUserPlan(user: UserCredentials) {
  try {
    return prisma.user.findUnique({
      where: {
        id: user.id,
        email: user.email,
      },
      select: {
        plan: true,
      },
    });
  } catch (error) {
    logAndThrow(error);
  }
}

export async function createFreePlan(
  user: UserCredentials & { firstName: string; lastName: string }
) {
  try {
    const currentFreePlan = await prisma.plan.findFirst({
      where: {
        tier: "FREE",
      },
      select: {
        id: true,
      },
    });

    if (!currentFreePlan) throw new Error("No free plan found");

    const currentUser = await findExistingUser(user);
    if (!currentUser)
      return prisma.plan.update({
        where: {
          id: currentFreePlan.id,
        },
        data: {
          users: {
            create: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
            },
          },
        },
      });

    return prisma.plan.update({
      where: {
        id: currentFreePlan.id,
      },
      data: {
        users: {
          connect: {
            id: currentUser.id,
          },
        },
      },
    });
  } catch (error) {
    logAndThrow(error);
  }
}

export async function loadPlanLimits(plan: Tier) {
  try {
    return prisma.plan.findFirst({
      where: {
        tier: plan,
      },
      select: {
        maxOrganizations: true,
        maxPositions: true,
        maxAchievements: true,
        maxChallenges: true,
        maxFailures: true,
        maxProjects: true,
      },
    });
  } catch (error) {
    logAndThrow(error);
  }
}

export async function loadUserOrgs(user: UserCredentials) {
  try {
    const currentUser = await findExistingUser(user);
    if (!currentUser) return undefined;
    if (!currentUser.plan) throw new Error("User plan not found");

    const planLimits = await loadPlanLimits(currentUser.plan.tier);

    return prisma.organization.findMany({
      where: {
        userId: user.id,
      },
      select: {
        name: true,
        slug: true,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: planLimits?.maxOrganizations,
    });
  } catch (error) {
    logAndThrow(error);
  }
}

export async function loadOrg(orgSlug: string) {
  try {
    const loadedOrg = await prisma.organization.findFirst({
      where: {
        slug: orgSlug.toLocaleLowerCase(),
      },
      select: {
        name: true,
        slug: true,
        states: true,
      },
    });

    if (!loadedOrg) return null;

    return {
      name: loadedOrg.name.toLocaleLowerCase(),
      slug: loadedOrg.slug.toLocaleLowerCase(),
      hasCreatedPositionBefore: loadedOrg.states?.firstPositionCreated || false,
      hasCreatedAchievementBefore:
        loadedOrg.states?.firstAchievementCreated || false,
      hasCreatedFailureBefore: loadedOrg.states?.firstFailureCreated || false,
      hasCreatedChallengeBefore:
        loadedOrg.states?.firstChallengeCreated || false,
      hasCreatedProjectBefore: loadedOrg.states?.firstProjectCreated || false,
    };
  } catch (error) {
    logAndThrow(error);
  }
}

export async function deleteOrg(orgSlug: string) {
  try {
    const currentOrg = await prisma.organization.findFirst({
      where: {
        slug: orgSlug.toLocaleLowerCase(),
      },
      select: {
        id: true,
        organizationStatesId: true,
      },
    });

    if (!currentOrg) return;

    await prisma.organization.delete({
      where: {
        id: currentOrg.id,
      },
    });

    await prisma.organizationStates.delete({
      where: {
        id: currentOrg.organizationStatesId ?? "",
      },
    });

    return;
  } catch (error) {
    logAndThrow(error);
  }
}

export async function loadPosition(parentOrg: string, currentPosition: string) {
  try {
    const parentOrganization = await prisma.organization.findFirst({
      where: {
        slug: parentOrg,
      },
      select: {
        id: true,
      },
    });

    if (!parentOrganization) throw new Error("Organization not found");

    return prisma.position.findFirst({
      where: {
        slug: currentPosition,
        organizationId: parentOrganization.id,
      },
      select: {
        title: true,
        slug: true,
        description: true,
        monthStartedAt: true,
        yearStartedAt: true,
      },
    });
  } catch (error) {
    logAndThrow(error);
  }
}

export async function createNewOrg(
  user: UserCredentials & { firstName: string; lastName: string },
  orgName: string,
  orgSlug: string
) {
  try {
    const currentUser = await findExistingUser(user);

    if (!currentUser) {
      await prisma.organization.create({
        data: {
          name: orgName.toLocaleLowerCase(),
          slug: orgSlug.toLocaleLowerCase(),
          states: {
            create: {},
          },
          user: {
            create: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              plan: {
                connectOrCreate: {
                  where: { tier: "FREE" },
                  create: { tier: "FREE" },
                },
              },
            },
          },
        },
      });

      return;
    }

    await prisma.organization.create({
      data: {
        name: orgName.toLocaleLowerCase(),
        slug: orgSlug.toLocaleLowerCase(),
        states: {
          create: {},
        },
        user: {
          connect: {
            id: currentUser.id,
          },
        },
      },
    });
    return;
  } catch (error) {
    logAndThrow(error);
  }
}

export async function createOrgPosition(
  orgSlug: string,
  newPosition: z.infer<typeof incomingNewTimelineMarkerBody>
) {
  try {
    const parentOrg = await prisma.organization.findUnique({
      where: {
        slug: orgSlug.toLocaleLowerCase(),
      },
      select: {
        id: true,
        states: {
          select: {
            firstPositionCreated: true,
          },
        },
      },
    });

    if (!parentOrg) throw new Error("Organization not found");
    // TODO: convert this into a transaxtion
    await prisma.position.create({
      data: {
        title: newPosition.title.toLocaleLowerCase(),
        slug: newPosition.slug.toLocaleLowerCase(),
        description: newPosition.description ?? "",
        monthStartedAt: newPosition.timeline.month as Month,
        yearStartedAt: newPosition.timeline.year,
        organization: {
          connect: {
            id: parentOrg.id,
          },
        },
      },
    });

    if (!!parentOrg.states?.firstPositionCreated === false)
      await prisma.organization.update({
        where: {
          id: parentOrg.id,
        },
        data: {
          states: {
            update: {
              firstPositionCreated: true,
            },
          },
        },
      });

    return;
  } catch (error) {
    logAndThrow(error);
  }
}

export async function loadOrgPositions(
  user: UserCredentials,
  orgSlug: string,
  { month, year }: { month?: Month; year?: number | string } = {}
) {
  try {
    const currentUser = await findExistingUser(user);
    if (!currentUser) return undefined;
    if (!currentUser.plan) throw new Error("User plan not found");

    const planLimits = await loadPlanLimits(currentUser.plan.tier);

    return prisma.organization.findUnique({
      where: {
        slug: orgSlug.toLocaleLowerCase(),
      },
      select: {
        positions: {
          select: {
            title: true,
            slug: true,
            monthStartedAt: true,
            yearStartedAt: true,
          },
          take: planLimits?.maxPositions,
        },
      },
    });
  } catch (error) {
    logAndThrow(error);
  }
}

export async function deletePosition(orgSlug: string, positionSlug: string) {
  try {
    const currentPosition = await findExistingPosition(orgSlug, positionSlug);
    if (!currentPosition) return;

    await prisma.position.delete({
      where: {
        id: currentPosition.id,
      },
    });
    return;
  } catch (error) {
    logAndThrow(error);
  }
}

export async function loadOrgStates(orgSlug: string) {
  try {
    return prisma.organization.findUnique({
      where: {
        slug: orgSlug.toLocaleLowerCase(),
      },
      select: {
        states: {
          select: {
            firstPositionCreated: true,
            firstAchievementCreated: true,
            firstChallengeCreated: true,
            firstFailureCreated: true,
            firstProjectCreated: true,
          },
        },
      },
    });
  } catch (error) {
    logAndThrow(error);
  }
}

function findExistingPosition(parentOrgSlug: string, positionSlug: string) {
  return prisma.position.findUnique({
    where: {
      slug: positionSlug.toLocaleLowerCase(),
      organization: {
        slug: parentOrgSlug.toLocaleLowerCase(),
      },
    },
    select: {
      id: true,
    },
  });
}

export async function loadPositionBenchmarks(
  user: UserCredentials,
  parentOrgSlug: string,
  positionSlug: string,
  benchmark: z.infer<typeof queriedBenchmark>
) {
  try {
    const currentUser = await findExistingUser(user);
    if (!currentUser) return undefined;
    if (!currentUser.plan) throw new Error("User plan not found");

    const position = await findExistingPosition(parentOrgSlug, positionSlug);
    if (!position) throw new Error("Position not found");

    const planLimits = await loadPlanLimits(currentUser.plan.tier);

    const defaults = {
      where: {
        positionId: position.id,
      },
      select: {
        title: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
    };

    switch (benchmark) {
      case benchmarks.ACHIEVEMENTS:
        return prisma.achievement.findMany({
          ...defaults,
          select: {
            ...defaults.select,
            monthOccuredAt: true,
            yearOccuredAt: true,
          },
          take: planLimits?.maxAchievements,
        });

      case benchmarks.FAILURES:
        return prisma.failure.findMany({
          ...defaults,
          select: {
            ...defaults.select,
            monthOccuredAt: true,
            yearOccuredAt: true,
          },
          take: planLimits?.maxFailures,
        });

      case benchmarks.PROJECTS:
        return prisma.project.findMany({
          ...defaults,
          select: {
            ...defaults.select,
            monthStartedAt: true,
            yearStartedAt: true,
          },
          take: planLimits?.maxProjects,
        });

      case benchmarks.CHALLENGES:
        return prisma.challenge.findMany({
          ...defaults,
          select: {
            ...defaults.select,
            monthOccuredAt: true,
            yearOccuredAt: true,
          },
          take: planLimits?.maxChallenges,
        });

      default:
        throw new Error("Unrecognized benchmarj");
    }
  } catch (error) {
    logAndThrow(error);
  }
}

export async function loadBenchmark(
  parentOrgSlug: string,
  parentPositionSlug: string,
  benchmark: Benchmark,
  payload: string
): Promise<BenchmarkPayload | undefined> {
  try {
    const position = await findExistingPosition(
      parentOrgSlug,
      parentPositionSlug
    );

    if (!position) throw new Error("Position not found");

    switch (benchmark) {
      case benchmarks.ACHIEVEMENTS:
        return prisma.achievement.findUniqueOrThrow({
          where: {
            slug: payload.toLocaleLowerCase(),
          },
          select: {
            title: true,
            slug: true,
            description: true,
            monthOccuredAt: true,
            yearOccuredAt: true,
            createdAt: true,
            updatedAt: true,
          },
        });

      case benchmarks.FAILURES:
        return prisma.failure.findUniqueOrThrow({
          where: {
            slug: payload.toLocaleLowerCase(),
          },
          select: {
            title: true,
            slug: true,
            description: true,
            monthOccuredAt: true,
            yearOccuredAt: true,
            createdAt: true,
            updatedAt: true,
          },
        });

      case benchmarks.PROJECTS:
        return prisma.project.findUniqueOrThrow({
          where: {
            slug: payload.toLocaleLowerCase(),
          },
          select: {
            title: true,
            slug: true,
            description: true,
            monthStartedAt: true,
            yearStartedAt: true,
            monthFinishedAt: true,
            yearFinishedAt: true,
            isAchievement: true,
            isFailure: true,
            createdAt: true,
            updatedAt: true,
          },
        });

      case benchmarks.CHALLENGES:
        return prisma.challenge.findUniqueOrThrow({
          where: {
            slug: payload.toLocaleLowerCase(),
          },
          select: {
            title: true,
            slug: true,
            description: true,
            monthOccuredAt: true,
            yearOccuredAt: true,
            monthSolvedAt: true,
            yearSolvedAt: true,
            isAchievement: true,
            isFailure: true,
            isProject: true,
            createdAt: true,
            updatedAt: true,
          },
        });

      default:
        throw new Error("Unrecognized benchmark");
    }
  } catch (error) {
    logAndThrow(error);
  }
}

const payloadSchema = incomingNewTimelineMarkerBody
  .extend({
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .merge(
    incomingNewProjectBody.extend({
      createdAt: z.date(),
      updatedAt: z.date(),
    })
  );
export async function createPositionBenchmark(
  parentOrgSlug: string,
  positionSlug: string,
  benchmark: z.infer<typeof queriedBenchmark>,
  payload: z.infer<typeof payloadSchema>
) {
  try {
    const position = await findExistingPosition(parentOrgSlug, positionSlug);

    if (!position) throw new Error("Position not found");

    const parentOrg = await prisma.organization.findUnique({
      where: {
        slug: parentOrgSlug.toLocaleLowerCase(),
      },
      select: {
        states: {
          select: {
            firstAchievementCreated: true,
            firstChallengeCreated: true,
            firstFailureCreated: true,
            firstProjectCreated: true,
          },
        },
      },
    });

    const defaults = {
      title: payload.title.toLocaleLowerCase(),
      slug: payload.slug.toLocaleLowerCase(),
      description: payload.description ?? "",
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
      position: {
        connect: {
          id: position.id,
        },
      },
    };

    switch (true) {
      case benchmark === benchmarks.PROJECTS: {
        await prisma.project.create({
          data: {
            ...defaults,
            monthStartedAt: payload.timeline.month as Month,
            yearStartedAt: payload.timeline.year,
          },
        });

        if (!parentOrg?.states?.firstProjectCreated)
          await prisma.organization.update({
            where: {
              slug: parentOrgSlug.toLocaleLowerCase(),
            },
            data: {
              states: {
                update: {
                  firstProjectCreated: true,
                },
              },
            },
          });

        return;
      }

      case benchmark === benchmarks.CHALLENGES: {
        await prisma.challenge.create({
          data: {
            ...defaults,
            monthOccuredAt: payload.timeline.month as Month,
            yearOccuredAt: payload.timeline.year,
          },
        });

        if (parentOrg?.states?.firstChallengeCreated)
          await prisma.organization.update({
            where: {
              slug: parentOrgSlug.toLocaleLowerCase(),
            },
            data: {
              states: {
                update: {
                  firstChallengeCreated: true,
                },
              },
            },
          });

        return;
      }

      case benchmark === benchmarks.FAILURES: {
        await prisma.failure.create({
          data: {
            ...defaults,
            monthOccuredAt: payload.timeline.month as Month,
            yearOccuredAt: payload.timeline.year,
          },
        });

        if (parentOrg?.states?.firstFailureCreated)
          await prisma.organization.update({
            where: {
              slug: parentOrgSlug.toLocaleLowerCase(),
            },
            data: {
              states: {
                update: {
                  firstFailureCreated: true,
                },
              },
            },
          });

        return;
      }

      case benchmark === benchmarks.ACHIEVEMENTS: {
        await prisma.achievement.create({
          data: {
            ...defaults,
            monthOccuredAt: payload.timeline.month as Month,
            yearOccuredAt: payload.timeline.year,
          },
        });

        if (parentOrg?.states?.firstAchievementCreated)
          await prisma.organization.update({
            where: {
              slug: parentOrgSlug.toLocaleLowerCase(),
            },
            data: {
              states: {
                update: {
                  firstAchievementCreated: true,
                },
              },
            },
          });

        return;
      }

      default:
        throw new Error("Unrecognized benchmark");
    }
  } catch (error) {
    logAndThrow(error);
  }
}

export async function deletePositionBenchmark(
  parentOrgSlug: string,
  positionSlug: string,
  benchmarkCategory: z.infer<typeof queriedBenchmark>,
  benchmarkToDelete: string
) {
  try {
    const position = await findExistingPosition(parentOrgSlug, positionSlug);

    if (!position) throw new Error("Position not found");

    switch (benchmarkCategory) {
      case benchmarks.ACHIEVEMENTS:
        await prisma.achievement.delete({
          where: {
            slug: benchmarkToDelete,
            positionId: position.id,
          },
        });
        break;

      case benchmarks.CHALLENGES:
        await prisma.challenge.delete({
          where: {
            slug: benchmarkToDelete,
            positionId: position.id,
          },
        });
        break;

      case benchmarks.FAILURES:
        await prisma.failure.delete({
          where: {
            slug: benchmarkToDelete,
            positionId: position.id,
          },
        });
        break;

      case benchmarks.PROJECTS:
        await prisma.project.delete({
          where: {
            slug: benchmarkToDelete,
            positionId: position.id,
          },
        });
        break;

      default:
        break;
    }

    return;
  } catch (error) {
    logAndThrow(error);
  }
}

function logAndThrow(error: unknown) {
  switch (true) {
    // This error is thrown when the query is invalid
    case error instanceof Prisma.PrismaClientKnownRequestError:
      console.error("Query is invalid", error.message);
      throw error;

    // This error is thrown when the Prisma Client encounters an unknown error
    case error instanceof Prisma.PrismaClientUnknownRequestError:
      console.error(
        "Prisma Client encountered an unknown error",
        error.message
      );
      throw error;

    // This error is thrown when the Prisma Client encounters a Rust panic
    case error instanceof Prisma.PrismaClientRustPanicError:
      console.error("Rust panic detected", error.message);
      throw error;

    // This error is thrown when the Prisma Client could not be initialized
    case error instanceof Prisma.PrismaClientInitializationError:
      console.error("Unable to initialize prisma error", error.message);
      throw error;

    // This error is thrown when validation fails, read more here: https://www.prisma.io/docs/orm/reference/error-reference
    case error instanceof Prisma.PrismaClientValidationError:
      console.error("Validation failed", error.message);
      throw error;

    // This error is thrown when you try to call `findMany` on an undefined object
    case error instanceof TypeError:
      console.error(
        "You call findMany method on an undefined object",
        error.message
      );
      throw error;

    default:
      // Unknown error
      console.error("Unknown error", error);
      throw error;
  }
}
