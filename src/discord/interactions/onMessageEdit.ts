import { Message, PartialMessage } from 'discord.js';
import { onMessageDelete } from './onMessageDelete';

export async function onMessageEdit(
  message: Message<boolean> | PartialMessage,
) {
  await onMessageDelete(message);
}
