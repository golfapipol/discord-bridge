import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import 'dotenv/config';

const commands = [
  new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask the assistant')
    .addStringOption(o => o.setName('question').setDescription('Your prompt').setRequired(true)),
  new SlashCommandBuilder()
    .setName('todo')
    .setDescription('Quick personal TODO')
    .addStringOption(o => o.setName('task').setDescription('Task text').setRequired(true)),
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
await rest.put(
  Routes.applicationGuildCommands(process.env.APP_ID, process.env.GUILD_ID),
  { body: commands },
);
console.log('✅  Slash commands registered!');
