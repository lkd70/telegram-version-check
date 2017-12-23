const 
    Telegraf  = require('telegraf'),
    format    = require('string-format'),
    { Extra } = Telegraf;

format.extend(String.prototype)

var config = process.argv[2] || __dirname + '\\config.json'
try {
    config = require(config)
} catch (e) {
    console.log("[ERROR] - Failed to get the config file " + config + ". Error: " + e.message)
    process.exit()
}

const app = new Telegraf(config.telegram.bot_token);

let bot_username = ''
app.telegram.getMe().then((botInfo) => {
    bot_username = botInfo.username
})

app.command('/start', (ctx) => {
    ctx.replyWithHTML("Welcome! This bot can be used inline or with the <code>/check</code> command.\nThe syntax of the version information must be: <code>#v4_6_0</code>")
})

app.command('/check', (ctx) => {
    let message = ctx.message.text.split("/check ")[1]
    let version_info = getVersion(message)
    if (version_info.error) {
        ctx.replyWithHTML(version_info.error)
    } else {
        let msg = version_info.results.map((v) => {return v.long_text}).join("\n\n")
        ctx.replyWithHTML(msg, Extra.webPreview(false));
    }
})

app.on('inline_query', (ctx) => {
    let message = ctx.inlineQuery.query.replace("@" + bot_username,'')
    let version_info = getVersion(message)
    let result = []
    if (version_info.error) {
        result = [{type:"article", id: ctx.inlineQuery.id, title: version_info.short_text, input_message_content:{message_text:version_info.long_text, parse_mode:"HTML"}}]
    } else {
        for (v=0;v<version_info.results.length;v++) {
            result.push({type:"article", id: ctx.inlineQuery.id + v, title: version_info.results[v].short_text, input_message_content:{message_text:version_info.results[v].long_text, parse_mode:"HTML"}})
        }
    }
    ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result, 0)
  })

getVersion = (message) => {
    if (message == undefined) {
        return {error: true, short_text:config.messages.undefined.short_text, long_text: config.messages.undefined.long_text}
    } else {
        let expression = /#v(\d+)_(\d+)_(\d+)/i
        if (message.match(expression)) {
            let version = expression.exec(message)
            /*
                version[1] == Major number.
                version[2] == Minor number.
                version[3] == Patch number.
            */
           let results = [
               {long_text:"Android " + config.messages.uptodate.long_text,short_text:"Android " + config.messages.uptodate.short_text},
               {long_text:"iOS " + config.messages.uptodate.long_text,short_text:"iOS " + config.messages.uptodate.short_text},
               {long_text:"Web " + config.messages.uptodate.long_text,short_text:"Web " + config.messages.uptodate.short_text},
               {long_text:"Desktop " + config.messages.uptodate.long_text,short_text:"Desktop " + config.messages.uptodate.short_text},
               {long_text:"Mac " + config.messages.uptodate.long_text,short_text:"Mac " + config.messages.uptodate.short_text},
               {long_text:"Windows Phone " + config.messages.uptodate.long_text,short_text:"Windows Phone " + config.messages.uptodate.short_text}
            ]

        if (version[1] != config.platforms.android.major || version[2] != config.platforms.android.minor || version[3] != config.platforms.android.patch) {
            results[0].long_text =  config.platforms.android.messages.long_text.format(config.platforms.android)
            results[0].short_text = config.platforms.android.messages.short_text.format(config.platforms.android)
        }

        if (version[1] != config.platforms.ios.major || version[2] != config.platforms.ios.minor || version[3] != config.platforms.ios.patch) {
            results[1].long_text =  config.platforms.ios.messages.long_text.format(config.platforms.ios)
            results[1].short_text = config.platforms.ios.messages.short_text.format(config.platforms.ios)
        }

        if (version[1] != config.platforms.web.major || version[2] != config.platforms.web.minor || version[3] != config.platforms.web.patch) {
            results[2].long_text =  config.platforms.web.messages.long_text.format(config.platforms.web)
            results[2].short_text = config.platforms.web.messages.short_text.format(config.platforms.web)
        }

        if (version[1] != config.platforms.desktop.major || version[2] != config.platforms.desktop.minor || version[3] != config.platforms.desktop.patch) {
            results[3].long_text =  config.platforms.desktop.messages.long_text.format(config.platforms.desktop)
            results[3].short_text = config.platforms.desktop.messages.short_text.format(config.platforms.desktop)
        }

        if (version[1] != config.platforms.mac.major || version[2] != config.platforms.mac.minor || version[3] != config.platforms.mac.patch) {
            results[4].long_text =  config.platforms.mac.messages.long_text.format(config.platforms.mac)
            results[4].short_text = config.platforms.mac.messages.short_text.format(config.platforms.mac)
        }

        if (version[1] != config.platforms.windows_phone.major || version[2] != config.platforms.windows_phone.minor || version[3] != config.platforms.windows_phone.patch) {
            results[5].long_text =  config.platforms.windows_phone.messages.long_text.format(config.platforms.windows_phone)
            results[5].short_text = config.platforms.windows_phone.messages.short_text.format(config.platforms.windows_phone)
        }

            return {error: false, results}
        } else {
            return {error: true, short_text:config.messages.formatting.short_text, long_text:config.messages.formatting.long_text}
        }
    }
}

app.startPolling()
