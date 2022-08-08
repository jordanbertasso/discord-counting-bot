import { CommandInteraction, TextChannel } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { createCountChannel } from '../../db';

export default {
  data: new SlashCommandBuilder()
    .setName('set-count-channel')
    .setDescription('Make this channel a counting channel')
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

    // Ignore messages not in a text channel
    if (!(interaction.channel instanceof TextChannel)) {
      return;
    }

    const hardMode = interaction.options.getBoolean('hard-mode') || false;

    // Add channel to database
    await createCountChannel(
      interaction.guild.id,
      interaction.channel.id,
      hardMode,
    );

    await interaction.reply({
      content: `Created channel <#${interaction.channel.id}> with hard mode: ${hardMode}`,
      ephemeral: true,
    });
  },
};
