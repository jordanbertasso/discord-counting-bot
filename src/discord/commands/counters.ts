import { CommandInteraction, MessageEmbed, TextChannel } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { getTopNUsersForGuild } from '../../db';

export default {
  data: new SlashCommandBuilder()
    .setName('counters')
    .setDescription('Get the top 5 counters for the server'),
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

    const top5Users: [string, number][] = await Promise.all(
      users.map(async ({ discordID, timesCounted }) => {
        const fetchedUser = await interaction.client.users.fetch(discordID);
        const userName = fetchedUser.username;

        return [userName, timesCounted];
      }),
    );

    // Build the message
    const message = new MessageEmbed()
      .setTitle('Top 5 Counters')
      .setColor('#0099ff')
      .addFields(
        ...top5Users.map(([userName, timesCounted]) => ({
          name: userName,
          value: timesCounted.toString(),
        })),
      );
    interaction.reply({ embeds: [message] });
  },
};
