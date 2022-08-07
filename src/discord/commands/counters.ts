import { CommandInteraction, MessageEmbed, TextChannel } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { getTopNUsersForGuild } from '../../db';

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

    // Get the top 5 users ordered by timesCounted
    const users = await getTopNUsersForGuild(interaction.guild.id, 5);

    // Build the message
    const message = new MessageEmbed()
      .setTitle('Top 5 Counters')
      .setColor('#0099ff')
      .setDescription(
        users
          .map(async (user, index) => {
            const fetchedUser = await interaction.client.users.fetch(
              user.discordID,
            );
            const userName = fetchedUser.username;

            return `${index + 1}. ${userName} - ${user.timesCounted}`;
          })
          .join('\n'),
      );
    interaction.reply({ embeds: [message] });
  },
};
