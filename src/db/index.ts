import { CountChannel, PrismaClient } from '@prisma/client';

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
