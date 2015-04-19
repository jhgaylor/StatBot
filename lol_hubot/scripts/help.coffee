# Description:
#   Generates help commands for Hubot.
#
# Commands:
#   help - Displays all of the help commands that Hubot knows about.
#   help <query> - Displays all help commands that match <query>.
#
# URLS:
#   /hubot/help
#
# Notes:
#   These commands are grabbed from comment blocks at the top of each file.

module.exports = (robot) ->
  robot.hear /help\s*(.*)?$/i, (msg) ->
    cmds = robot.helpCommands()
    filter = msg.match[1]

    if filter
      cmds = cmds.filter (cmd) ->
        cmd.match new RegExp(filter, 'i')
      if cmds.length == 0
        msg.send "No available commands match #{filter}"
        return
    
    # exclude help text that expects the bots name to be present
    # ie: "robot.respond" but actually based on the help text in the docs
    cmds = cmds.filter (cmd) ->
      res = cmd.match /^hubot/i
      return ! res

    prefix = robot.alias or robot.name
    cmds = cmds.map (cmd) ->
      cmd = cmd.replace /^hubot/, prefix
      cmd.replace /hubot/ig, robot.name


    emit = cmds.join "\n"

    msg.send emit
