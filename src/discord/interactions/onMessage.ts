import { Message, MessageEmbed, TextChannel } from 'discord.js';
import {
  getCountChannelForGuild,
  incrementTimesCountedForUser,
  updateCountForChannel,
  updateCountRecordForChannel,
  updateLastCountTimeForChannel,
  updateLastNumberSenderForChannel,
} from '../../db';

export async function onMessage(message: Message<boolean>) {
  // Ignore messages from bots
  if (message.author.bot) {
    return;
  }

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

  // Check if the message is an embed or an attachment
  if (message.attachments.size > 0 || message.embeds.length > 0) {
    return;
  }

  // Check if the message is a number
  const number = Number(message.content);
  if (isNaN(number)) {
    return;
  }

  // Ignore the message if it's sender is the last number sender
  if (message.author.id === countChannel.lastNumberSenderDiscordID) {
    return;
  }

  // Process the number
  // Check if the message matches the next count
  const nextCount = countChannel.currentCount + 1;
  if (number !== nextCount) {
    // If less than a second has passed since the last count, ignore the message
    // This prevents accidental double-counting
    if (
      number === countChannel.currentCount &&
      new Date().getTime() - countChannel.lastCountTime.getTime() < 5000
    ) {
      return;
    }

    // Add a cross mark to the message
    await message.react('❌');

    // Save the record to the database
    const record = await updateCountRecordForChannel(
      countChannel,
      countChannel.currentCount,
    );

    // Update the channel description with the record
    // if (message.channel.isText()) {
    //   await (message.channel as TextChannel).setTopic(`Record: ${record}`);
    // }

    // Reset the count to 0
    await updateCountForChannel(countChannel, 0);

    // Reset the last number sender
    await updateLastNumberSenderForChannel(countChannel, '');

    // Remove the users send messages permission from the channel if hard mode is enabled
    if (countChannel.hardMode) {
      await message.channel.permissionOverwrites.create(message.author, {
        SEND_MESSAGES: false,
      });
    }

    // Send embed to the channel
    await message.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: message.author.username,
          })
          .setTitle('`OUT` at ' + countChannel.currentCount)
          .setDescription(
            'This user failed to continue the count' + (countChannel.hardMode
              ? 'and is now excluded from the channel.'
              : ''),
          )
          .addField('The counter', 'has been set back to `0`.')
          .setColor(message.author.hexAccentColor || 'RED'),
      ],
    });
  } else {
    // Add a check mark to the message
    await message.react('✅');

    // Update the last number sender
    await updateLastNumberSenderForChannel(countChannel, message.author.id);

    // Update the count
    await updateCountForChannel(countChannel, nextCount);

    // Update the stats for the author
    await incrementTimesCountedForUser(message.author.id, message.guild.id);

    // Update last count time
    await updateLastCountTimeForChannel(countChannel);

    // Save the record to the database
    await updateCountRecordForChannel(countChannel, nextCount);
  }
}
