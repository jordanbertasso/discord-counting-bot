import { CommandInteraction, TextChannel } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { getCountChannelForGuild, updateCountForChannel } from '../../db';

export default {
  data: new SlashCommandBuilder()
    .setName('set-count')
    .setDescription('Set the count for a channel')
    .addNumberOption((option) =>
      option.setName('count').setDescription('The value of the new count'),
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

    const count = interaction.options.getNumber('count') || 0;

    // Update the count
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

    await updateCountForChannel(countChannel, count);

    await interaction.reply(
      `<@${interaction.user.id}> set the count to ${count}`,
    );
  },
};
