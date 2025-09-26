import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  MessageFlags,
} from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';

declare module 'discord.js' {
  interface Client {
    commands: Collection<string, any>;
  }
}

// Bot login and setup
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.login(process.env.TOKEN);

// Slash command handling
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => {
    return file.endsWith('.js') || file.endsWith('.ts');
  });
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const commandModule = await import(filePath);
    const command = commandModule.default || commandModule;
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const eventsPath = path.join(__dirname, 'listeners');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => {
  return file.endsWith('.js') || file.endsWith('.ts');
});

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const eventModule = await import(filePath);
  const event = eventModule.default || eventModule;
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}
