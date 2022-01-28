import DiscordJs, { Intents, Interaction, InteractionWebhook, Message } from 'discord.js'
import dotenv from 'dotenv'
import { MessageEmbed } from 'discord.js';
import mysql from 'mysql';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'cyberlabs',
    password: 'CYB3RL4BS_!!FLAgs!',
    database: 'flag_storage'
})

connection.connect()


var currentTime = new Date();
var currentOffset =currentTime.getTimezoneOffset()
var ISTOffset=330;
var ISTTime=new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
var hourIST=ISTTime.getHours()
var minuteIST=ISTTime.getMinutes()
//let date = new Date().toLocaleString("en-US", { timeZone: "Asia/kolkata" });
//const d = new Date()
//var Months=['Jan','Feb','Mar','April','May','June','July','August','Sept','Oct','Nov','Dec'];
//var days=['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY',"SATURDAY"];
//Replies, flags, level and role
let replies = ["Good Going", "Keep it up", "Success! Great work..."];

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}
dotenv.config()  //gives access to .env file as environment variables
const client = new DiscordJs.Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]  //what info bot needs, what bot does
})


//slash commands
client.on('ready', () => {
    console.log('The bot is ready');
    const guildID = "922466623514890321"//"788403195641724969"
    const guild = client.guilds.cache.get(guildID)
    let commands   //handles commands for a guild
    if (guild) {
        commands = guild.commands
    }
    else {
        commands = client.application.commands
    }
    commands.create({
        name: 'submit',
        description: 'give me flags and in return take your role',
        options: [
            {
                name: 'game',
                description: 'Name of your game',
                required: true,
                type: DiscordJs.Constants.ApplicationCommandOptionTypes.STRING
            },
            {
                name: 'level',
                description: 'level of your game',
                required: true,
                type: DiscordJs.Constants.ApplicationCommandOptionTypes.NUMBER
            },
            {
                name: 'flag',
                description: 'Flag',
                required: true,
                type: DiscordJs.Constants.ApplicationCommandOptionTypes.STRING
            },
            //    default_permission: ['VIEW_CHANNEL', 'MANAGE_CHANNELS', 'MANAGE_ROLES'];

        ]


    })

})


client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) { return; }
    const { commandName, options } = interaction
    if (commandName === 'submit') {
        const username = interaction.member.user['username'] + "#" + interaction.member.user['discriminator'];
        const game = options.getString('game').toLowerCase();
        const lvl = options.getNumber('level');
        const flag = options.getString('flag');
        var data = `${username}\t${game}\t${lvl}\t${flag}`;
        //DB variables ->user_name,oswap_lvl,unixit_lvl,username
  
	 if (game == "oswap" || game == "unixit") {
    connection.query(`select flag from ${game} where chall=${lvl}`, function (err, rows, fields) {
            if (err) console.log(err);
//	let date = new Date().toLocaleString("en-US", { timeZone: "Asia/kolkata" });  
// console.log(username+"-"+"level"+lvl+"-"+flag+"-"+rows[0]['flag']+"-"+date);
     })
            var current_lvl = 0;
            connection.query(`select ${game} from scoreboard where username ="${username}"`,async  function (err, rows, fields) {
                if (err) throw err;

                if (rows.length == 0) {
                    connection.query(`insert ignore into scoreboard(username,unixit,oswap) values("${username}",0,0)`, async function (err, rows, fields) {
                        if (err) {
                            current_lvl = -1;
                        }
                        else {
                            current_lvl = 0;
                        }
                    })
                }
                else {
                    current_lvl = rows[0][game];
                    if (current_lvl > lvl) {
        let date = new Date().toLocaleString("en-US", { timeZone: "Asia/kolkata" });        	
 console.log(username + "-" + "level" + lvl + "-" + flag + "-" + rows[0]['flag'] + "-" +"Already Solved the challenge"+"-"+ date);
                     
	 await             interaction.deferReply({
            ephemeral: true
        })
//	wait(4000);
       await   interaction.editReply({
            content: `Already Solved the challenge`,
        })

 // interaction.reply({
                          //  content: "Already Solved the challenge",
                         //   ephemeral: true,
                        //})
                        return;
                    }
                    else if (current_lvl < lvl) {
    let date = new Date().toLocaleString("en-US", { timeZone: "Asia/kolkata" });
                        console.log(username + "-" + "level" + lvl + "-" + flag + "-" + rows[0]['flag'] + "-" +"Solve previous levels first...."+"-"+ date);

			 await  interaction.deferReply({
            ephemeral: true
        })
         //new Promise(resolve => setTimeout(resolve, 5000))
//wait(4000);        
await interaction.editReply({
            content: `Solve previous levels first....`,
        })                        

//interaction.reply({
                           // content: "Solve previous levels first...",
                          //  ephemeral: false,
                        //})
                        return;
                    }
                    else {
		//	console.log('entering');
                        connection.query(`select flag from ${game} where chall=${current_lvl}`, async function (err, rows, fields) {
				//console.log('rows: ', rows);
                            if (err) throw err;
                            if (flag != rows[0]['flag']) {
let date = new Date().toLocaleString("en-US", { timeZone: "Asia/kolkata" });                               
 console.log(username + "-" + "level" + lvl + "-" + flag + "-" + rows[0]['flag'] + "-" +"Wrong Flag"+"-"+ date);
 
				await interaction.deferReply({
        			    ephemeral: true
			        })
			//console.log('interaction replying');
			await interaction.editReply({
		            content: "Wrong flag",
		        });
			//console.log('interaction replied');

				// interaction.reply({
                                   // content: "Wrong flag",
                                  //  ephemeral: true
                                //})
                            }
                            else {
                                var server = interaction.guild;
                                let category = server.channels.cache.find(c => c.name == game && c.type == "category");

                                let channel, old_channel;
                                if (game == "unixit") {
                                    channel = server.channels.cache.find(guild => guild.name === `unixit-${current_lvl + 1}`);//&& guild.parentId==`${`"${game}"`+"_id" }`  ),
                                    old_channel = server.channels.cache.find(guild => guild.name === `unixit-${current_lvl}`);//&& guild.parentId==`${`"${game}"`+"_id" }` );
                                }
                                else {
                                    channel = server.channels.cache.find(guild => guild.name === `oswap-${current_lvl + 1}`);//&& guild.parentId==`${`"${game}"`+"_id" }`  ),
                                    old_channel = server.channels.cache.find(guild => guild.name === `oswap-${current_lvl}`);//&& guild.parentId==`${`"${game}"`+"_id" }` );
                                }
                                channel.permissionOverwrites.edit(interaction.member.id, { VIEW_CHANNEL: true });
                                old_channel.permissionOverwrites.edit(interaction.member.id, { VIEW_CHANNEL: false });
let date = new Date().toLocaleString("en-US", { timeZone: "Asia/kolkata" });				
console.log(username + "-" + "level" + lvl + "-" + flag + "-" + rows[0]['flag'] + "-" +"Correct Flag!"+"-"+ date);
                          
                                const rndInt = randomIntFromInterval(0, 2);
   await interaction.deferReply({
            ephemeral: true
        })
        //new Promise(resolve => setTimeout(resolve, 5000))
//wait(4000);        
await  interaction.editReply({
            content: replies[rndInt],
        })
                               // interaction.reply({
                                 //   content: replies[rndInt],
                                  //  ephemeral: true,
                               // })

                                // writing
                                connection.query(`update scoreboard set ${game}=${current_lvl + 1} where username ="${username}"`, function (err, result) {
                                    if (err) throw err;
                                })
                            }
                        })
                    }
                }
            })
        }

        else {
            interaction.reply({
                content: "Invalid Game",
                ephemeral: true,
            })
        }
        connection.query('select * from scoreboard', function (err, rows, fields) {
            if (err) console.log("failed here");
            })
    }

    if (commandName === 'add') {
        const num1 = options.getNumber('num1');
        const num2 = options.getNumber('num2')

         interaction.deferReply({
            ephemeral: true
        })
         //new Promise(resolve => setTimeout(resolve, 5000))
        interaction.editReply({
            content: `The sum is ${num1 + num2}`,
        })
    }



})

client.on("message", message => {
    var flag=0;

    if (message.content.startsWith('/' + 'scoreboard')) {
    if (message.member.roles.cache.some(role => role.name === 'root' || role.name==="sys-admin")){flag=1;}

    if(flag){
        var game = message.content.split(' ')[1];
        connection.query(`select username,${game} from scoreboard order by ${game} DESC   `, function (err, rows, fields) {
            if (err) 
            {console.log("Error in  command"); }
            else {
                
                const exampleEmbed = new MessageEmbed();
                exampleEmbed.setColor("0x0099ff")   
                exampleEmbed.setTitle('Scores')

                for (let i = 0; i < rows.length; i++) {
                    exampleEmbed.addFields(
                        {
                            name: `${rows[i]['username']}`,
                            value: `${rows[i][game]}`,
                            inline: false,
                        },
                    )
                }
                message.channel.send({ embeds: [exampleEmbed] });
            }
        });
    }
    else{
        message.reply("You are not authorised for the command");
    }
    }

});

client.login(process.env.TOKEN);
