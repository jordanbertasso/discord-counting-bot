import { Interaction, TextBasedChannel } from 'discord.js';

export const parseNumber = (input: string | null) => {
  if(!input) return NaN;
  // test for octal values with leading zero (e.g. '010')
  if (/^0[0-9]+$/.test(input)) return parseInt(input, 8);
  else return Number(input);
}

const getChannelName = (channel: TextBasedChannel | null) => {
  let channelName = 'unknown';

  if (channel) {
    if ('name' in channel) {
      channelName = `#${channel.name}`;
    } else {
      channelName = channel.id;
    }
  }

  return channelName;
};

export const logInteraction = (interaction: Interaction) => {
  let logString = '';

  const channelName = getChannelName(interaction.channel);
  logString = `${interaction.user.tag} in channel ${channelName} triggered an interaction`;

  if (interaction.isCommand()) {
    const commandName = interaction.commandName;
    logString += ` - command: ${commandName}`;
  }

  console.log(logString);
};
