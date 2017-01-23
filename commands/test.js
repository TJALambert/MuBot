module.exports = {
  usage: "+mu test",
	description: "Responds with works if the bot is alive",
	process: function(msg, suffix) {
	  msg.reply("Works!")
	}
}