const config = require('./CONFIG.json')

let ping = require('./commands/ping.js')
let queue = require('./commands/queue.js')
let pause = require('./commands/pause.js')
let resume = require('./commands/resume.js')
let skip = require('./commands/skip.js')
let list = require('./commands/list.js')
let join = require('./commands/join.js')

let helpCommand = "help"

let commands = {
  'ping': ping,
  'queue': queue,
  'pause': pause,
  'resume': resume,
  'skip': skip,
  'list': list,
  'join': join,
  
  // Example disabled
  //'disabled': disabled
  
  // Below command will list all the commands available, comment out a comment above to disable it
  'help':
  {
    command:      helpCommand,
    usage:        config.botPrefix + " " + helpCommand,
  	description: "Lists all commands",
		process: function(bot, msg, suffix) {
		  let msgOut = "Help:" +'\n```'
			for (let cmd in commands) {
			  msgOut += '\n' + commands[cmd].usage + '\n' + commands[cmd].description +'\n'
      }
      msgOut += "```"
      msg.channel.sendMessage(msgOut)
    }
  }
}



module.exports = commands