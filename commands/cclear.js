module.exports = {
    execute,
    name: 'cclear',
    description: 'clear x messages in current channel',
    hasArgs: true,
    usage: '<Number>',
    scope: ['text'], // dm, group, text, news, store (voice, category)
    roleNeeded: ['staff']
}

function execute(message, args) {

    if (typeof args[0] === "undefined") {
        message.channel.send("Veuillez donner un argument")
    }

    else if (args[0] < 2 || args[0] > 99 || isNaN(args[0])) {
        message.channel.send("Veuillez donner un nombre entre 2 et 99")
    }

    else {
        let value = parseInt(args[0], 10) + 1
        message.channel.bulkDelete(value).catch((error) => {
            console.log("ERROR : " + error)
            message.channel.send("Vous pouvez seulement supprimer les messages de moins de 14 jours")
            return "error"
        }).then((isError) => {
            if (isError !== "error")
                message.author.createDM()
                    .then((DM) => {
                        DM.send(args[0] + " messages ont été supprimés")
                    })
                    .catch(console.error(error))
                /*message.channel.send(args[0] + " messages ont été supprimés")
                    .then((message) => {
                        for (let i = 3; i < 0 ; i--) {
                            setTimeout(() => {
                                message.edit(message.content + (i))
                            }, (3-i)*1000);
                        }
                        message.edit("test")
                        message.delete(3000)
                    })*/
        });
    }
}