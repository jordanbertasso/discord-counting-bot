import { Message, MessageEmbed, PartialMessage, TextChannel } from 'discord.js';
import { getCountChannelForGuild } from '../../db';

export async function onMessageDelete(
  message: Message<boolean> | PartialMessage,
) {
  // Ignore messages not in a guild
  if (!message.guild) {
    return;
  }

  // Ignore messages not in a text channel
  if (!(message.channel instanceof TextChannel)) {
    return;
  }

  // Check if the message is in a counting channel
  const countChannel = await getCountChannelForGuild(
    message.guild.id,
    message.channel.id,
  );
  if (!countChannel) {
    return;
  }

  // Check if the message was the last number sent
  if (
    message.author?.id === countChannel.lastNumberSenderDiscordID &&
    Number(message.content) === countChannel.currentCount
  ) {
    // Name and shame the author
    await message.channel.send({
      embeds: [
        new MessageEmbed()
          .setTitle('Shame')
          .setDescription(`${message.author} is a cheat.`)
          .setColor(0xff0000),
      ],
    });

    // Remove the users send messages permission from the channel
    await message.channel.permissionOverwrites.create(message.author, {
      SEND_MESSAGES: false,
    });
  }
}
