const fs = require('fs');
const Router = require('./router');
const helper = require('./helper');

// Data:
const data = require('../data/timetable.json');
let users = require('../data/users.json');

const router = new Router();


/* API endpoints below */

router.command('start', ctx => ctx.reply('Дороу!'));
router.command('invite', ctx => ctx.reply('http://t.me/GubaPWNZ_bot'));

router.command('reg', ctx => ctx.reply('Введи номер подгруппы (цифрой)'));

for (let index of [1, 2])
    router.text(index + '', ctx => {
        if (!router.state[ctx.from.id] || router.state[ctx.from.id].command !== 'reg') {
            ctx.reply(router.errorMessage);
            return;
        }

        let userInfo = {
            "id": ctx.from.id,
            "firstName": ctx.from.first_name,
            "lastName": ctx.from.last_name,
            "group": index
        };

        if (!users[ctx.from.id]) {
            users[ctx.from.id] = userInfo;
            fs.writeFile('./data/users.json', JSON.stringify(users), err => {
                if (err) {
                    ctx.reply('Произошла ошибка. Попробуй еще раз.');
                    return;
                }

                users = require('../data/users.json');
                ctx.reply('Данные сохранены.');
            });
        } else 
            ctx.reply('Пользователь с твоим id уже сохранен.');
    });

router.command('oddity', ctx => {
    let oddity = 
        (helper.oddityOfWeek() === 'evenWeek') ?
            'нижняя' : 
            'верхняя';

    ctx.reply(`Сейчас ${oddity} неделя`);
});

router.command('today', ctx => {
    let group = null;
    if (users[ctx.from.id])
        group = users[ctx.from.id].group;

    let response = 
        helper.timetableByDay(helper.today(), group);

    ctx.replyWithMarkdown(response);
});

router.command('tomorrow', ctx => {
    let day = helper.today();
    day = (day < 6) ? day + 1 : 0;

    let group = null;
    if (users[ctx.from.id])
        group = users[ctx.from.id].group;

    let response =
        (day === 0) ?
            helper.timetableByNextDay(day, group) :
            helper.timetableByDay(day, group);
    
    ctx.replyWithMarkdown(response);
});

router.command('day', ctx => ctx.reply('Какой день недели тебя интересует?'));
router.command('nextday', ctx => ctx.reply('Какой день недели тебя интересует?'));

for (let dayString of data.daysRu)
    router.text(dayString, ctx => {
        let id = ctx.message.from.id;

        if (!router.state[id] || ['day', 'nextday'].indexOf(router.state[id].command) === -1) {
            ctx.reply(router.errorMessage);
            return;
        }

        let day = data.daysRu.indexOf(dayString);
        let today = helper.today();

        let group = null;
        if (users[ctx.from.id])
            group = users[ctx.from.id].group;

        let response = 
            (day < today && router.state[id].command === 'nextday') ? 
                helper.timetableByNextDay(day, group) : 
                helper.timetableByDay(day, group);

        ctx.replyWithMarkdown(response);
    });

router.command('week', getCallbackWeek());
router.command('nextweek', getCallbackWeek(true));

function getCallbackWeek(next) {
    return ctx => {
        let response = '';
        
        let group = null;
        if (users[ctx.from.id])
            group = users[ctx.from.id].group;

        let i = 0;
        while (i <= 6) {
            response += next ? helper.timetableByNextDay(i, group) : helper.timetableByDay(i, group);
            i++;
        }
    
        ctx.replyWithMarkdown(response);
    }
}

router.command('next', ctx => {
    let currentHour = new Date().getUTCHours() + 8;
    let currentMinutes = new Date().getUTCMinutes();

    if (currentHour > 24) currentHour -= 24;

    let day = helper.today();
    let dayString = data.days[day];
    
    let nextLessons = [];

    if (data[helper.oddityOfWeek()][dayString])
        nextLessons = data[helper.oddityOfWeek()][dayString].filter(
            item => {
                let time = item.time.split(':');

                return parseInt(time[0]) >= currentHour && parseInt(time[1]) > currentMinutes;
            } 
        );

    let nextWeek = false;

    while (nextLessons.length === 0) {
        if (day < 6)
            day++;
        else {
            day = 0;
            nextWeek = true;
        }

        dayString = data.days[day];
        if (data[helper.oddityOfWeek()][dayString])
            nextLessons = data[helper.oddityOfWeek(nextWeek)][dayString];
    }

    let response = `*Следующая пара (${data.daysRu[day]}):*\n\n`;

    let group = null;
    if (users[ctx.from.id])
        group = users[ctx.from.id].group;

    if (group)
        nextLessons = nextLessons.filter(
            entry => [group, 3].indexOf(entry.group) !== -1
        );

    if (nextLessons.length > 1 && nextLessons[0].time === nextLessons[1].time) {
        [nextLessons[0], nextLessons[1]].forEach(
            entry => response += helper.entryToString(entry, true)
        );
    } else 
        response += helper.entryToString(nextLessons[0], true);

    ctx.replyWithMarkdown(response);
});

function check(arr) {
    return arr.length === 0;
}

module.exports = router