import { CountChannel, PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export async function createCountChannel(guildID: string, channelID: string) {
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
        server: {
          connect: {
            id: server.id,
          },
        },
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

export async function incrementTimesCountedForUser(userDiscordID: string) {
  let user = await prisma.user.findFirst({
    where: {
      discordID: userDiscordID,
    },
  });

  if (!user) {
    user = await createUser(userDiscordID, 'discordID');
  }

  prisma.user.update({
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
