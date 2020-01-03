const monthsName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const daysName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const animationTime = 250;

let currentMonthDiff = 0;
let events = new Map();
let seminars = new Map();

let infoContainer = $('.calendar-information-container');
let leftArrow = $('.calendar-left-arrow');
let rightArrow = $('.calendar-right-arrow');

function drawMonth(monthDiff)
{
    let now = new Date();

    //$('.calendarpicture .day').text(`${now.getDate()}, ${getDayName(now.getDay())}`);

    let days = $('.calendarnumber');

    days.addClass(`empty`);
    days.removeClass('current-day');
    days.text("");
    days.attr('data-date', '');

    let deltaY = 0;
    let deltaM = 0;
    let month;

    if(monthDiff !== 0)
    {
        if(Math.abs(monthDiff) >= 12)deltaY += Math.trunc(monthDiff/12);
        deltaM += monthDiff-deltaY*12;

        if(now.getMonth()+1+monthDiff-deltaY*12 > 12)
        {
            deltaY++;
            monthDiff--;
        }

        if(now.getMonth()+1+monthDiff-deltaY*12 <= 0)
        {
            deltaY--;
            monthDiff++;
        }
    }

    month = now.getMonth()+deltaM;
    if(month < 0)month = 12+month;

    $('.calendarpicture .month').text(`${getMothName(month)}, ${now.getFullYear()+deltaY}`);

    let week = 0;
    let prevDay;
    for(let i = 0; i < 31; i++)
    {
        let date = new Date(`${now.getFullYear()+deltaY}-${month+1}-${i+1}`);

        if(prevDay != null && prevDay > date.getDate())break;

        let dayPosition = date.getDay() === 0 ? 6 : date.getDay() - 1;
        let currentPosition = days[week*7 + dayPosition];
        currentPosition.innerText = date.getDate();
        currentPosition.classList.remove('empty');
        if(date.getTime() === new Date(`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`).getTime())currentPosition.classList.add('current-day');

        currentPosition.setAttribute('data-date', `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);

        let top = 0;
        if(events.has(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`))
        {
            currentPosition.innerHTML += '<a class="calendar-event"></a>';
            top = 15;
        }
        if(seminars.has(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`))currentPosition.innerHTML += `<a class="calendar-seminar" style="top: ${top}px;"></a>`;


        if(date.getDay() === 0) week++;
        prevDay = date.getDate();
    }

}

function init()
{
    return new Promise((resolve, reject) =>
    {
        let f1 = fetch('/events/all?noimages=true');
        let f2 = fetch('/seminars/all?noimages=true');

        Promise.all([f1, f2]).then(async (responses) =>
        {
            let eventsArray = await responses[0].json();
            for(let event of eventsArray) mapData(event.date, events, event);

            let seminarArray = await responses[1].json();
            for(let seminar of seminarArray) mapData(seminar.date, seminars, seminar);

            resolve();
        });
    });
}

function mapData(data, map, obj)
{
    let date = new Date(data);
    let dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if(map.has(dateString)){
        let newValue = map.get(dateString);
        newValue.push(obj);
        map.set(dateString, newValue);
    }
    else map.set(dateString, [obj]);
}

function getDayName(dayNumber)
{
    if(dayNumber < 0 || dayNumber > 6)return 'Invalid day';
    return daysName[dayNumber];
}

function getMothName(monthNumber)
{
    if(monthNumber < 0 || monthNumber > 11)return 'Invalid month';
    return monthsName[monthNumber];
}

$(() =>
{
    init().then(() => drawMonth(0));
});

$(".calendarpicture .calendar-left-arrow").click(function ()
{
    if(!$(this).hasClass('visible'))return;
    currentMonthDiff--;
    drawMonth(currentMonthDiff);
});

$(".calendarpicture .calendar-right-arrow").click(function ()
{
    if(!$(this).hasClass('visible'))return;
    currentMonthDiff++;
    drawMonth(currentMonthDiff);
});

$('.calendarnumber').click(function ()
{
    if($(this).hasClass('empty'))return;

    let dateAttr = $(this).attr('data-date');

    let spitDate = dateAttr.split('-');

    let day = spitDate[2];
    let month = spitDate[1];
    let year = spitDate[0];

    let dayEvents = events.get(dateAttr);
    let daySeminars = seminars.get(dateAttr);

    $('.calendarpicture .date-info').text(`${getMothName(month)} ${day}`).addClass('visible');
    leftArrow.removeClass('visible');
    rightArrow.removeClass('visible');
    infoContainer.addClass('visible');
});

$('#close-calendar-menu-btn').click(() =>
{
    $('.calendarpicture .date-info').removeClass('visible');
    leftArrow.css('display', 'block').addClass('visible');
    rightArrow.css('display', 'block').addClass('visible');
    infoContainer.removeClass('visible');
});