import { CountChannel, PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

prisma.$use(async (params, next) => {
  // Check incoming query type
  if (params.model === 'CountChannel') {
    if (params.action === 'findFirst' || params.action === 'findUnique') {
      params.action = 'findFirst';
      params.args.where = {
        ...params.args.where,
        deletedAt: null,
      };
    }

    if (params.action === 'findMany') {
      // Find many queries
      if (params.args.where) {
        if (params.args.where.deletedAt === undefined) {
          // Exclude deleted records if they have not been explicitly requested
          params.args.where['deletedAt'] = null;
        }
      }
    }
  }

  return next(params);
});

prisma.$use(async (params, next) => {
  // Check incoming query type
  if (params.model === 'CountChannel') {
    if (params.action === 'update') {
      // Change to updateMany - you cannot filter
      // by anything except ID / unique with findUnique
      params.action = 'updateMany';
      // Add 'deleted' filter
      // ID filter maintained
      params.args.where['deletedAt'] = null;
    }

    if (params.action === 'updateMany') {
      if (params.args.where !== undefined) {
        params.args.where['deletedAt'] = null;
      } else {
        params.args['where'] = { deleted: null };
      }
    }
  }

  return next(params);
});

prisma.$use(async (params, next) => {
  // Check incoming query type
  if (params.model === 'CountChannel') {
    if (params.action == 'delete') {
      // Delete queries
      // Change action to an update
      params.action = 'update';
      params.args['data'] = { deletedAt: new Date() };
    }
    if (params.action == 'deleteMany') {
      // Delete many queries
      params.action = 'updateMany';
      if (params.args.data !== undefined) {
        params.args.data['deletedAt'] = new Date();
      } else {
        params.args['data'] = { deletedAt: new Date() };
      }
    }
  }

  return next(params);
});

export async function createCountChannel(
  guildID: string,
  channelID: string,
  hardMode = false,
) {
  // Create the server if it doesn't exist
  let server = await prisma.server.findFirst({
    where: {
      discordID: guildID,
    },
  });
  if (!server) {
    server = await prisma.server.create({
      data: {
        discordID: guildID,
      },
    });
  }

  // Create the channel if it doesn't exist
  const channel = await prisma.countChannel.findFirst({
    where: {
      discordID: channelID,
    },
  });
  if (!channel) {
    await prisma.countChannel.create({
      data: {
        discordID: channelID,
        hardMode,
        server: {
          connect: {
            id: server.id,
          },
        },
      },
    });
  }
}

export async function deleteCountChannel(guildID: string, channelID: string) {
  const channel = await prisma.countChannel.findFirst({
    where: {
      discordID: channelID,
      server: {
        discordID: guildID,
      },
    },
  });

  if (channel) {
    await prisma.countChannel.delete({
      where: {
        id: channel.id,
      },
    });
  }
}

export async function getCountChannelForGuild(
  guildID: string,
  channelID: string,
) {
  return await prisma.countChannel.findFirst({
    where: {
      discordID: channelID,
      server: {
        discordID: guildID,
      },
    },
  });
}

export async function updateCountForChannel(
  countChannel: CountChannel,
  count: number,
) {
  return await prisma.countChannel.update({
    where: {
      id: countChannel.id,
    },
    data: {
      currentCount: count,
    },
  });
}

export async function updateCountRecordForChannel(
  countChannel: CountChannel,
  count: number,
): Promise<number> {
  // Get the last count record
  const lastCountRecord = await prisma.countChannel.findFirst({
    where: {
      id: countChannel.id,
    },
    select: {
      recordCount: true,
    },
  });

  if (!lastCountRecord) {
    throw new Error('No last count record found');
  }

  if (lastCountRecord.recordCount < count) {
    await prisma.countChannel.update({
      where: {
        id: countChannel.id,
      },
      data: {
        recordCount: count,
      },
    });

    return count;
  } else {
    return lastCountRecord.recordCount;
  }
}

export async function updateLastCountTimeForChannel(
  countChannel: CountChannel,
) {
  return await prisma.countChannel.update({
    where: {
      id: countChannel.id,
    },
    data: {
      lastCountTime: new Date(),
    },
  });
}

export async function updateLastNumberSenderForChannel(
  countChannel: CountChannel,
  discordID: string,
) {
  return await prisma.countChannel.update({
    where: {
      id: countChannel.id,
    },
    data: {
      lastNumberSenderDiscordID: discordID,
    },
  });
}

export async function createUser(
  discordID: string,
  guildID: string,
): Promise<User> {
  // Create the server if it doesn't exist
  let server = await prisma.server.findFirst({
    where: {
      discordID: guildID,
    },
  });
  if (!server) {
    server = await prisma.server.create({
      data: {
        discordID: guildID,
      },
    });
  }

  // Create the user if it doesn't exist
  let user = await prisma.user.findFirst({
    where: {
      discordID: discordID,
      server: {
        discordID: discordID,
      },
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        discordID: discordID,
        server: {
          connect: {
            id: server.id,
          },
        },
      },
    });
  }

  return user;
}

export async function incrementTimesCountedForUser(
  userDiscordID: string,
  guildID: string,
) {
  let user = await prisma.user.findFirst({
    where: {
      discordID: userDiscordID,
      server: {
        discordID: guildID,
      },
    },
  });

  if (!user) {
    user = await createUser(userDiscordID, guildID);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { timesCounted: { increment: 1 } },
  });
}

export async function getTopNUsersForGuild(guildID: string, n: number) {
  return await prisma.user.findMany({
    where: {
      server: {
        discordID: guildID,
      },
    },
    orderBy: { timesCounted: 'desc' },
    take: n,
  });
}
