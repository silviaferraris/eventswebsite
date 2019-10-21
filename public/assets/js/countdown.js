$(document).ready(() =>
{
    $(".countdown").each(function () {
        let dateApi = $(this).attr("data-date_api");
        let thisCountdown = $(this);
        if(!dateApi)return;
        fetch(dateApi).then(async result =>
        {
            let jsonRes = await result.json();
            if(jsonRes.found)
            {
                let date = new Date(jsonRes.date);

                window.setInterval(() =>
                {
                    let currDate = new Date();
                    let diffSeconds = (date - currDate)/1000;
                    let remainTime = secondsToDHMS(diffSeconds);
                    setTime(thisCountdown, remainTime)
                }, 1000);
            }
        })
    });
});

function setTime(countdown, time)
{
    countdown.find(".days").text(time.days < 10 ? `0${time.days}` : time.days);
    countdown.find(".hours").text(time.hours < 10 ? `0${time.hours}` : time.hours);
    countdown.find(".minutes").text(time.minutes < 10 ? `0${time.minutes}` : time.minutes);
    countdown.find(".seconds").text(time.seconds < 10 ? `0${time.seconds}` : time.seconds);
}

function secondsToDHMS(seconds)
{
    let days = Math.floor(seconds / (24*3600));
    let remain = seconds % (24*3600);
    let hours = Math.floor(remain / 3600);
    remain %= 3600;
    let minutes = Math.floor(remain / 60);
    remain %= 60;

    return {
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: Math.floor(remain)
    }
}