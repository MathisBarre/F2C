const fs = require('fs')
const Discord = require('discord.js')
const {prefix, presentationRoom} = require("./data.json")
const token = process.env.TOKEN

const client = new Discord.Client()
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith(".js"));

commandFiles.forEach( (commandFile) => {
    const command = require(`./commands/${commandFile}`);
    // Lie le nom de la commande avec le fichier correspondant
    client.commands.set(command.name, command);
})

client.once('ready', () => {
	console.log('Ready!');
});

client.login(token);

// Create an event listener for new guild members
client.on('guildMemberAdd', member => {

  // Send the message to a designated channel on a server:

  const channel = member.guild.channels.find(channel => channel.name === presentationRoom);
  // Do nothing if the channel wasn't found on this server
  if (!channel) return;

  // Send the message, mentioning the member
  channel.send(`Bienvenue sur le serveur, ${member}. Présente-toi dans ce salon pour avoir accès au reste du serveur`);
});

// Command handler
client.on('message', (message) => {
    // Avoid bot auto-reply & non-prefixed command
    if (message.author.bot) return
    if (message.content.slice(0,prefix.length) !== prefix) return
    
    // Find a intialize commandName & args
    const messageArray = message.content.toLowerCase().split(/ +/g)
    const commandName = messageArray.shift().slice(prefix.length)
    const args = messageArray

    // Debug informations
    console.log(`\nNouvelle commande ! \nCommande : ${commandName}\nArguments : ${args}\n`)

    // Error on unknown command
    if (!client.commands.has(commandName)) { 
        let errorMsg = 'Erreur : commande inexistante'
        console.error(errorMsg)
        message.reply(errorMsg)
        return 
    }

    // Initialize command
    const command = client.commands.get(commandName)
    
    // Execute command and catch on error
    try {
        if (command.scope && !command.scope.some((oneScope) => message.channel.type === oneScope ) ) {
            message.reply('Vous ne pouvez pas effectuer cette commander ici');
            return
        } 

        else if (command.roleNeeded && !command.roleNeeded.some((roleNeeded) => message.member.roles.some((role) => role.name.toLowerCase() === roleNeeded.toLowerCase()))) {
            message.reply(`vous n\'avez pas le rôle nécessaire pour effectuer cette commande\nRôle(s) autorisé(s) : ${command.roleNeeded}`)
        }
        
        else if (command.hasArgs && !args.length) {
            let reply = `Vous n'avez fourni aucun argument !`

            if (command.usage) {
                reply = `${reply} Commande attendue : \`${prefix}${commandName} ${command.usage}\``
            }

            message.reply(reply)
            return
        }  
        
        else {
            command.execute(message, args);
        }
    } catch (error) {
        console.error(error);
        message.reply('Erreur : L\'execution de la commande échoué')
    }
})

// Enter confirmation
client.on('message', (message) => {
    if (message.author.bot) return;
    let memberRoleName = 'someone'
    if (message.channel.name === presentationRoom && !message.member.roles.find(role => role.name === memberRoleName)) {
        if (message.content.length < 10){
            message.reply('ton message de présentation est trop court');
        } else {
            message.member.addRole(message.guild.roles.find((role)=> role.name === memberRoleName))
            .catch((error) => {
                message.channel.send(`Une erreur est survenue dans l\'attribution de ton rôle ${message.guild.roles.find((role) => role.name === "staff")}\n${error}`);
                console.error(error);
                return error
            })
            .then((role)=>{
                if ( role.name === "TypeError") return
                message.channel.send(`Merci pour ton message de présentation ${message.member}, tu as maintenant accès au reste du serveur`)
            })
        }
    }
})