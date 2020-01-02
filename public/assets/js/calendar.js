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


/*window.onload = function () {
    let date= new Date();
    let month_name = [' January', 'February', 'March', 'April', 'May', 'June'
    ,'July', 'August', 'September', 'October', 'November', 'December'];
    let month =date.getMonth();
    let year = date.getFullYear();
    let first_date = month_name[month] + " " + 1 + " " + year;
    let temp = new Date(first_date).toDateString();
    let first_day = temp.substring(0,3);
    let day_name = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let day_num = day_name.indexOf(first_day);
    let days = new Date(year, month+1, 0).getDate();
    let calendar= getCalendar(day_num,days);
    document.getElementById("calendar-month-year").innerHTML = month_name[month]+" "+ year;
    document.getElementById("calendar-dates").appendChild(calendar);
};*/

/*function getCalendar(day_num, days) {
    let table = document.createElement('table');
    let tr = document.createElement('tr');
    //row for the day letters
    for (let a = 0; a <= 6; a++) {
        let td = document.createElement('td');
        td.innerHTML = "MTWTFSS"[a];
        tr.appendChild(td);
    }
    table.appendChild(tr);

    tr = document.createElement('tr');
    let a;
    for (a=0; a<=6; a++){
        if(a===day_num)
        {
        break;
        }
        let td = document.createElement('td');
        tr.innerHTML = "";
        tr.appendChild(td);
        }
    let count = 1;
    for (; a<=6; a++){
        let td = document.createElement('td');
        td.innerHTML = String(count);
        count++;
        tr.appendChild(td);
    }
    table.appendChild(tr);

    for (let r=3; r<=7; r++){
        tr = document.createElement('tr');
        for (let c=0; c<=6; c++){
            if (count > days){
                table.appendChild(tr);
                return table;
            }
            let td = document.createElement('td');
            td.innerHTML = String(count);
            count++;
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    return table;
}*/