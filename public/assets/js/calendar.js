let monthsName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let daysName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function initCalendar(monthDiff)
{
    let now = new Date();

    $('.calendarpicture .day').text(`${now.getDate()}, ${getDayName(now.getDay())}`);
    $('.calendarpicture .month').text(`${getMothName(now.getMonth())}`);
    let days = $('.calendarnumber');

    days.addClass(`empty`);
    days.removeClass('current-day');


    let deltaY = 0;
    let deltaM = 0;

    if(monthDiff >= 12)deltaY += Math.trunc(monthDiff/12);



    let week = 0;
    for(let i = 0; i < 31; i++)
    {
        let date = new Date(`${now.getFullYear()}-${now.getMonth()+1}-${i+1}`);
        if(date.getMonth() > now.getMonth())break;

        let dayPosition = date.getDay() === 0 ? 6 : date.getDay() - 1;
        let currentPosition = days[week*7 + dayPosition];
        currentPosition.innerText = date.getDate();
        currentPosition.classList.remove('empty');
        if(date.getTime() === new Date(`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`).getTime())currentPosition.classList.add('current-day');

        if(date.getDay() === 0) week++;
    }

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

$(initCalendar());