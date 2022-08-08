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
    )
    .addBooleanOption((option) =>
      option
        .setName('hard-mode')
        .setDescription(
          'Whether to remove people if they fail to continue the count',
        ),
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
      topic: 'https://github.com/jordanbertasso/discord-counting-bot',
    });

    if (!channel) {
      await interaction.reply({
        content: 'Could not create channel',
        ephemeral: true,
      });
      return;
    }

    const hardMode = interaction.options.getBoolean('hard-mode') || false;

    // Add channel to database
    await createCountChannel(interaction.guild.id, channel.id, hardMode);

    await interaction.reply({
      content: `Created channel <#${channel.id}> with hard mode: ${hardMode}`,
      ephemeral: true,
    });
  },
};
