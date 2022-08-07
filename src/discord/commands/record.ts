import { CommandInteraction, TextChannel } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { getCountChannelForGuild } from '../../db';

export default {
  data: new SlashCommandBuilder()
    .setName('record')
    .setDescription('Get the record for this channel'),
  public: true,
  async execute(interaction: CommandInteraction) {
    if (!interaction.guild) {
      interaction.reply('This command can only be used in a server');
      return;
    }

    // Ignore messages not in a text channel
    if (!(interaction.channel instanceof TextChannel)) {
      return;
    }

    // Get count channel
    const countChannel = await getCountChannelForGuild(
      interaction.guild.id,
      interaction.channel.id,
    );
    if (!countChannel) {
      // Tell the user this channel is not a counting channel
      interaction.reply({
        content: 'This channel is not a counting channel',
        ephemeral: true,
      });
      return;
    }

    await interaction.reply(
      `The record for <#${interaction.channelId}> is ${countChannel.recordCount}`,
    );
  },
};
