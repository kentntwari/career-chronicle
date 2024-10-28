import { Prisma } from "@prisma/client";

import { z } from "zod";

import { prisma } from "@/lib/prisma";

const userCredentialsSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});

type UserCredentials = z.infer<typeof userCredentialsSchema>;

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

export async function loadUserOrgs(user: UserCredentials) {
  try {
    const currentUser = await findExistingUser(user);

    if (!currentUser) return undefined;

    if (!currentUser.plan) throw new Error("User plan not found");

    switch (currentUser.plan.tier) {
      case "FREE":
        return await loadFreeUserOrgs(user);

      default:
        // TODO: remember to implement catered results for PRO users
        return await loadFreeUserOrgs(user);
    }
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
          user: {
            create: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
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
      },
    });
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
