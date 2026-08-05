import type { MessageCommand } from 'commandkit';
import { joinVoiceChannel,  createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState} from '@discordjs/voice';
import path from 'path'; 

export const message: MessageCommand = async (ctx) => {
    const { message } = ctx;
    if (message.author.bot) return;

    if (message.content === '!play') {
        const voiceChannel = message.member?.voice.channel; 

        if (!voiceChannel) {
             await message.reply('You need to join a voice channel first');
            return;
        }

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id, 
                guildId: voiceChannel.guild.id, 
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            await entersState(connection, VoiceConnectionStatus.Ready, 20_000);

            const player = createAudioPlayer();
            const filePath = path.join(__dirname, '3am_spotdown.org.mp3'); 
            const resource = createAudioResource(filePath);
            
            player.play(resource);
            connection.subscribe(player);

            await message.reply("Now playing audio!");

            player.on(AudioPlayerStatus.Idle, () => {
                connection.destroy();
            });

            player.on('error', (error) => {
                console.error(`Audio Player Error: ${error.message}`);
                connection.destroy();
            });            
        } catch (error) {
            console.error(error);
            await message.reply('Failed to join or play audio in the voice channel.');            
        }
    }
};
