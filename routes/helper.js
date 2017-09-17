const data = require('../data/timetable.json');

// Oddity of week:
module.exports.oddityOfWeek = (next) => {
    let now = new Date();
    let startTimeOfCurrentYear = (new Date(now.getFullYear(), 0, 1).getTime());
    let currentTime = now.getTime();
    let pastTimeOfStartCurrentYear = currentTime - startTimeOfCurrentYear;
    
    // Division by number of milliseconds in one week:
    let numberOfWeekInCurrentYear = Math.ceil(pastTimeOfStartCurrentYear / 604800000);

    if (next)
        return  (numberOfWeekInCurrentYear % 2 !== 0) ? 'evenWeek' : 'oddWeek'; 
    else
        return  (numberOfWeekInCurrentYear % 2 === 0) ? 'evenWeek' : 'oddWeek'; 
};

// Get string of entry:
module.exports.entryToString = (entry, formatting) => {
    let group;

    switch (entry.group) {
        case 1:
            group = 'первой подгруппы';
            break;
        case 2:
            group = 'второй подгруппы';
            break;
        case 3:
            group = 'всей группы';
            break;
        default:
            group = 'кого-то';
    }

    let result;

    if (formatting)
        result = `В *${entry.time}* у ${group} "${entry.title}" в аудитории *${entry.classRoom}*\n\n`;
    else
        result = `В ${entry.time} у ${group} "${entry.title}" в аудитории ${entry.classRoom}\n`;

    return result;
};

// Numeric index of current day:
module.exports.today = () => {
    let now = new Date();
    let day = now.getUTCDay();

    if (now.getUTCHours() < 16) // 16 equal to 24 in GMT+8
        day = (day > 0) ? day - 1 : 6;

    return day;
};

// Timetable by day for current week:
module.exports.timetableByDay = day => {
    let when = '';

    let today = module.exports.today();

    if (day === today) 
        when = 'Сегодня';
    else if (today < 6 && day - 1 === today || today === 6 && day === 0) 
        when = 'Завтра';
    else if (day === 1)
        when = 'Во ' + data.daysRu[day];
    else {
        when = 'В ' + data.daysRu[day];
        if ([2, 4, 5].indexOf(day) !== -1)
            when = when.substring(0, when.length - 1) + 'у';
    }

    let dayString = data.days[day];

    if (!data[module.exports.oddityOfWeek()][dayString])
        return when + ' занятий нет\n';

    let whenArr = when.split(' ');
    let dayRuString = whenArr.length > 1 ? whenArr[1] : when.toLowerCase();

    let response = `*Расписание на ${dayRuString}:*\n\n`;
    
    for (let entry of data[module.exports.oddityOfWeek()][dayString])
        response += module.exports.entryToString(entry, true);

    return response;
};

// Timetable by day for next week:
module.exports.timetableByNextDay = day => {
    let when = '';

    if ([0, 1, 3].indexOf(day) !== -1)
        when += 'следующий ';
    else if (day === 6)
        when += 'следующее ';

    let dayRuString = data.daysRu[day];
    if ([2, 4, 5].indexOf(day) !== -1)
        when += 'следующую ' + dayRuString.substring(0, dayRuString.length - 1) + 'у';
    else
        when += dayRuString;

    let dayString = data.days[day];

    if (!data[module.exports.oddityOfWeek(true)][dayString])
        return `В ${when} занятий нет\n`;

    let response = `*Расписание на ${when}:*\n\n`;

    for (let entry of data[module.exports.oddityOfWeek(true)][dayString])
        response += module.exports.entryToString(entry, true);

    return response;
}