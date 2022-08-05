import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ChannelTypes } from 'discord.js/typings/enums';
import { createCountChannel } from '../../db';

export default {
  data: new SlashCommandBuilder()
    .setName('begin')
    .setDescription('Create a new channel and begin a new count')
    .addStringOption((option) =>
      option
        .setName('channel-name')
        .setDescription('The name of the channel to create'),
    ),
  async execute(interaction: CommandInteraction) {
    if (!interaction.guild) {
      interaction.reply('This command can only be used in a server');
      return;
    }

    const channelName =
      interaction.options.getString('channel-name') || 'counting';

    // Create the channel
    const channel = await interaction.guild.channels.create(channelName, {
      type: ChannelTypes.GUILD_TEXT,
    });

    if (!channel) {
      await interaction.reply({
        content: 'Could not create channel',
        ephemeral: true,
      });
      return;
    }

    // Add channel to database
    await createCountChannel(interaction.guild.id, channel.id);

    await interaction.reply({
      content: `Created channel <#${channel.id}>`,
      ephemeral: true,
    });
  },
};
