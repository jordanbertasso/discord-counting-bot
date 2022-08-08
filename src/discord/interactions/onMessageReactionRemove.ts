import {
  MessageEmbed,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  TextChannel,
  User,
} from 'discord.js';
import { getCountChannelForGuild } from '../../db';

export async function onMessageReactionRemove(
  messageReaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
) {
  // Ignore messages not in a guild
  if (!messageReaction.message.guild) {
    return;
  }

  // Ignore messages not in a text channel
  if (!(messageReaction.message.channel instanceof TextChannel)) {
    return;
  }

  // Check if the message is in a counting channel
  const countChannel = await getCountChannelForGuild(
    messageReaction.message.guild.id,
    messageReaction.message.channel.id,
  );
  if (!countChannel) {
    return;
  }

  // Check if the reaction was a ✅
  if (messageReaction.emoji.name !== 'white_check_mark') {
    return;
  }

  // Check if the message was the last number sent
  if (
    messageReaction.message.author?.id ===
      countChannel.lastNumberSenderDiscordID &&
    Number(messageReaction.message.content) === countChannel.currentCount
  ) {
    // Name and shame the person who deleted the checkmark
    await messageReaction.message.channel.send({
      embeds: [
        new MessageEmbed()
          .setTitle('Shame')
          .setDescription(`<@${user.id}> is a cheat.`)
          .setColor(0xff0000),
      ],
    });

    // Remove the users send messages permission from the channel
    await messageReaction.message.channel.permissionOverwrites.create(user.id, {
      SEND_MESSAGES: false,
    });
  }
}
