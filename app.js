const Telegraf = require('telegraf');
const config = require('./config');

const bot = new Telegraf(config.token);

// Routing:
const router = require('./routes');
router.errorMessage = 'Такой команды нет. Смотри список команд';

let users = null;
router.default(ctx => {
    let id = ctx.from.id;

    if (!users) users = require('./data/users.json');

    if (users[id].admin && router.state[id].command === 'sendmessage') {
        for (let key in users)
            bot.telegram.sendMessage(key, ctx.message.text);
    } else {
        return;
    }
});

bot.use(router.routes());


bot.startPolling();