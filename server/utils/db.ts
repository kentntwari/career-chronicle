import { Month, Prisma, Tier } from "@prisma/client";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import * as zs from "~/utils/zschemas";

type UserCredentials = z.infer<typeof zs.userCredentialsSchema>;

async function findExistingUser(user: UserCredentials) {
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

function loadFreeUserOrgs(user: UserCredentials) {
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
    take: 5,
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

export async function findUserPlan(user: UserCredentials) {
  try {
    return await prisma.user.findUnique({
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
      return await prisma.plan.update({
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

    return await prisma.plan.update({
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
    return await prisma.plan.findFirst({
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

    switch (currentUser.plan.tier) {
      case "FREE":
        return await loadFreeUserOrgs(user);

      default:
        // FIX: Implement catered results for PRO users
        return await loadFreeUserOrgs(user);
    }
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
      name: loadedOrg.name,
      slug: loadedOrg.slug,
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

    const position = await prisma.position.findFirst({
      where: {
        slug: currentPosition,
        organizationId: parentOrganization.id,
      },
      select: {
        title: true,
        slug: true,
        achievements: {
          select: {
            title: true,
            slug: true,
          },
        },
        challenges: {
          select: {
            title: true,
            slug: true,
          },
        },
        failures: {
          select: {
            title: true,
            slug: true,
          },
        },
        projects: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    });

    return position;
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
  newPosition: z.infer<typeof zs.incomingNewPositionBody>
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
        title: newPosition.title,
        slug: newPosition.slug,
        description: newPosition.description ?? "",
        monthStartedAt: newPosition.tenure.month as Month,
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
  } catch (error) {
    logAndThrow(error);
  }
}

export async function loadOrgPositions(
  orgSlug: string,
  { month, year }: { month?: Month; year?: number | string } = {}
) {
  try {
    return await prisma.organization.findUnique({
      where: {
        slug: orgSlug.toLocaleLowerCase(),
      },
      select: {
        positions: {
          select: { title: true, slug: true },
        },
      },
    });
  } catch (error) {
    logAndThrow(error);
  }
}

export async function loadOrgStates(orgSlug: string) {
  try {
    return await prisma.organization.findUnique({
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
