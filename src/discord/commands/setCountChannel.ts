import { CommandInteraction, TextChannel } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { createCountChannel } from '../../db';

export default {
  data: new SlashCommandBuilder()
    .setName('set-count-channel')
    .setDescription('Make this channel a counting channel'),
  async execute(interaction: CommandInteraction) {
    if (!interaction.guild) {
      interaction.reply('This command can only be used in a server');
      return;
    }

    // Ignore messages not in a text channel
    if (!(interaction.channel instanceof TextChannel)) {
      return;
    }

    // Add channel to database
    await createCountChannel(interaction.guild.id, interaction.channel.id);

    await interaction.reply({
      content: `Created channel <#${interaction.channel.id}>`,
      ephemeral: true,
    });
  },
};
