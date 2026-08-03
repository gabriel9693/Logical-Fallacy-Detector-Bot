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

export const chatInput: ChatInputCommand = async (ctx) => {
    const { interaction } = ctx;
    const argument = interaction.options?.getString('argument'); 

    if (argument?.length! < 50) {
        return interaction.reply({ content: "The argument is too short, must be at least 50 characters", ephemeral: true});
    }

    await interaction.deferReply();
    const analysis = await detectFallacies(argument!);
    await interaction.editReply(analysis);
};


