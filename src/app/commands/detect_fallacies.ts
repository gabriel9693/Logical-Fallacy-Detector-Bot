import type { ChatInputCommand, CommandData } from 'commandkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { detectFallacies } from '../../../detector';

export const command: CommandData = {
  name: 'detect-fallacies',
  description: 'Detects logical fallacies of a provided argument via an LLM',
  options: [
    {
      name: 'argument', 
      type: ApplicationCommandOptionType.String, 
      description: "The argument to analyze", 
      required: true
    }
  ]
};

function splitMessage(text: string, maxLength = 1950) {
  if (text.length <= maxLength) return [text];

  const chunks = []; 
  let currentChunk = '';

  const lines = text.split('\n'); 

  for (const line of lines) {
    if((currentChunk + '\n' + line).length > maxLength) {
      if(currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }

      if (line.length > maxLength) {
        const words = line.split(' '); 
        for(const word of words) {
          if((currentChunk + ' ' + word).length > maxLength) {
            chunks.push(currentChunk.trim());
            currentChunk = word;
          }
          else {
            currentChunk += (currentChunk ? ' ' : '') + word;
          }
        }
      }
      else {
        currentChunk = line;
      }
    }
    else {
      currentChunk += (currentChunk ? '\n' : '') + line;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

export const chatInput: ChatInputCommand = async (ctx) => {
    const { interaction } = ctx;
    const argument = interaction.options?.getString('argument'); 

    if (argument?.length! < 50) {
        return interaction.reply({ content: "The argument is too short, must be at least 50 characters", ephemeral: true});
    }

    await interaction.deferReply();
    const analysis = await detectFallacies(argument!);

    const chunks = splitMessage(analysis);
    await interaction.editReply(chunks[0]!);

    for(let i = 1; i < chunks.length; i++) {
      await interaction.followUp(chunks[i]!);
    }
};




