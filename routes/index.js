const Router = require('./router');
const helper = require('./helper');

// Data:
const data = require('../data/timetable.json');

const router = new Router();


/* API endpoints below */

router.command('start', ctx => ctx.reply('Дороу!'));

router.command('oddity', ctx => {
    let oddity = 
        (helper.oddityOfWeek() === 'evenWeek') ?
            'нижняя' : 
            'верхняя';

    ctx.reply(`Сейчас ${oddity} неделя`);
});

router.command('today', ctx => {
    let response = 
        helper.timetableByDay(helper.today());

    ctx.replyWithMarkdown(response);
});

router.command('tomorrow', ctx => {
    let day = helper.today();
    day = (day < 6) ? day + 1 : 0;

    let response =
        (day === 0) ?
            helper.timetableByNextDay(day) :
            helper.timetableByDay(day);
    
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

        let response = 
            (day < today && router.state[id].command === 'nextday') ? 
                helper.timetableByNextDay(day) : 
                helper.timetableByDay(day);

        ctx.replyWithMarkdown(response);
    });

router.command('week', getCallbackWeek());
router.command('nextweek', getCallbackWeek(true));

function getCallbackWeek(next) {
    return ctx => {
        let response = '';
        
        let i = 0;
        while (i <= 6) {
            response += next ? helper.timetableByNextDay(i) : helper.timetableByDay(i);
            i++;
        }
    
        ctx.replyWithMarkdown(response);
    }
}

router.command('next', ctx => {
    let currentHour = new Date().getUTCHours() + 8;
    if (currentHour > 24) currentHour -= 24;

    let day = helper.today();
    let dayString = data.days[day];
    
    let nextLessons = [];

    if (data[helper.oddityOfWeek()][dayString])
        nextLessons = data[helper.oddityOfWeek()][dayString].filter(
            item => parseInt(item.time.split(':')[0]) > currentHour
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

    if (nextLessons.length > 1 && nextLessons[0].time === nextLessons[1].time) {
        [nextLessons[0], nextLessons[1]].forEach(
            entry => response += helper.entryToString(entry, true)
        );
    } else 
        response += helper.entryToString(nextLessons[0]);

    ctx.replyWithMarkdown(response);
});

function check(arr) {
    return arr.length === 0;
}

module.exports = router