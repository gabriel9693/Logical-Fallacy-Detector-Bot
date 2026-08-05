import type { EventHandler } from 'commandkit';
import { Logger } from 'commandkit/logger';
import { generateDependencyReport } from '@discordjs/voice';

const handler: EventHandler<'clientReady'> = async (client) => {
  Logger.info(`Logged in as ${client.user.username}!`);
  console.log(generateDependencyReport());
};

export default handler;
