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
_ = require 'underscore'

helpContents = (name, commands) ->

  """
<html>
  <head>
  <title>#{name} Help</title>
  <style type="text/css">
    body {
      background: #d3d6d9;
      color: #636c75;
      text-shadow: 0 1px 1px rgba(255, 255, 255, .5);
      font-family: Helvetica, Arial, sans-serif;
    }
    h1 {
      margin: 8px 0;
      padding: 0;
    }
    .commands {
      font-size: 13px;
    }
    p {
      border-bottom: 1px solid #eee;
      margin: 6px 0 0 0;
      padding-bottom: 5px;
    }
    p:last-child {
      border: 0;
    }
  </style>
  </head>
  <body>
    <h1>#{name} Help</h1>
    <div class="commands">
      #{commands}
    </div>
  </body>
</html>
  """

# TODO: how can i make this DRY?
Mixpanel = require('mixpanel')
# create an instance of the mixpanel client
mixpanel_api_key = process.env.STATBOT_MIXPANEL_KEY
if mixpanel_api_key
  mixpanel = Mixpanel.init(mixpanel_api_key)

module.exports = (robot) ->
  robot.hear /(help|h|hello|hi|sup)\s*(.*)?$/i, (msg) ->
    user = msg.message.user
    # track an event with optional properties
    mixpanel and mixpanel.track("lolhubot:command", {
      command: "help"
      user_id: user.id
      summoner_name: user.summoner_name
    })

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
      # replace references to hubot with this StatBot
      cmd = cmd.replace /^hubot/, prefix
      cmd = cmd.replace /hubot/ig, robot.name
      # replace ** w/ a new line.
      return cmd.replace /\*\*/g, "\n"

    cmdNames = cmds.map (cmd) ->
      return cmd.split(' ')[0]

    msg.send "Help:"
    cmds.forEach (cmd) ->
      msg.send "#{cmd}\n"
    msg.send "All available commands: "
    msg.send _.unique(cmdNames).join(', ')


  robot.router.get "/#{robot.name}/help", (req, res) ->
    cmds = robot.helpCommands().map (cmd) ->
      cmd.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')

    emit = "<p>#{cmds.join '</p><p>'}</p>"

    emit = emit.replace /hubot/ig, "<b>#{robot.name}</b>"

    res.setHeader 'content-type', 'text/html'
    res.end helpContents robot.name, emit
