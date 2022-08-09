import { CommandInteraction, TextChannel } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { deleteCountChannel } from '../../db';

export default {
  data: new SlashCommandBuilder()
    .setName('unset-count-channel')
    .setDescription('Make this channel a normal channel'),
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
    await deleteCountChannel(interaction.guild.id, interaction.channel.id);

    await interaction.reply({
      content: `Made channel <#${interaction.channel.id}> a normal channel`,
      ephemeral: true,
    });
  },
};
