const Telegraf = require('telegraf');
const config = require('./config');

/* Stub for heroku web app */

const http = require('http');
const appInfo = require('./package.json');

const app = http.createServer((req, res) => {
    res.end('Telegram bot "Timetable IPO-14". Version: ' + appInfo.version);
});
app.listen(8080);


/* Bot */

const bot = new Telegraf(config.token);

// Routing:
const router = require('./routes');
router.errorMessage = 'Такой команды нет. Смотри список команд';

bot.use(router.routes());

bot.startPolling();