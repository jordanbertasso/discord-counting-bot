import {
  Client,
  Collection,
  Intents,
  Permissions,
  CommandInteraction,
} from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { logInteraction } from './util';
import pingCommand from './commands/ping';
import beginCommand from './commands/begin';
import setCountCommand from './commands/setCount';
import setCountChannelCommand from './commands/setCountChannel';
import recordCommand from './commands/record';
import countersCommand from './commands/counters';
import { onMessage } from './interactions/onMessage';
import { onMessageDelete } from './interactions/onMessageDelete';
import { onMessageEdit } from './interactions/onMessageEdit';
import { onMessageReactionRemove } from './interactions/onMessageReactionRemove';

// Create a new client instance
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

type TPermissionSlashCommand = {
  data:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  execute: (interaction: CommandInteraction) => Promise<void>;
  public?: boolean;
};

// Add commands
const commands = new Collection<string, TPermissionSlashCommand>();
commands.set(pingCommand.data.name, pingCommand);
commands.set(beginCommand.data.name, beginCommand);
commands.set(setCountCommand.data.name, setCountCommand);
commands.set(setCountChannelCommand.data.name, setCountChannelCommand);
commands.set(recordCommand.data.name, recordCommand);
commands.set(countersCommand.data.name, countersCommand);

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log('Ready!');
});

client.on('messageCreate', async (message) => {
  await onMessage(message);
});

client.on('messageDelete', async (message) => {
  await onMessageDelete(message);
});

client.on('messageEdit', async (message) => {
  await onMessageEdit(message);
});

client.on('messageReactionRemove', async (messageReaction, user) => {
  await onMessageReactionRemove(messageReaction, user);
});

// Handle command interactions
client.on('interactionCreate', async (interaction) => {
  logInteraction(interaction);

  if (!interaction.isCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) return;

  if (!command.public) {
    if (!interaction.memberPermissions?.has(Permissions.FLAGS.ADMINISTRATOR)) {
      interaction.reply('You are not authorized to use this command.');
      return;
    }
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    try {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
    }
  }
});

export default client;
