import Performer from '../../assets/js/modules/performer.mjs'

$(document).ready(() =>
{
    let performerList = $(".performer-container ul");
    performerList.html("");
    Performer.getAllPerformers().then(performers=>{
        for(let performer of performers){
            let card = $(`<li class="performer-card">
            <div></div>
            <img src="${performer.photo}">
            <span>${performer.firstName} ${performer.lastName}</span>
            <a href="/performers/${performer.performerId}"></a>
        </li>`);
            performerList.append(card);
        }
    })

});

let container;
let cardWidth;
let scrollTimer;

$(document).on('mouseover', '.performer-card', function () {
    let img = $(this).find('img').attr('src');
    $('.performer-bg').css('background-image', `url("${img}")`);
    $('.banner-bg').css('opacity', 0);
});

$(document).on('mouseout', '.performer-card', function () {
    $('.banner-bg').css('opacity', 1);
});

$(window).resize(() =>
{
    adjustContainerSize();
    alignCards();
});

$(() =>
{
    container = $(".performer-container")[0];
    let scrollTimer;

    adjustContainerSize();

    window.addEventListener('wheel', wheelEvent, {passive: false});
    container.addEventListener('wheel', (e) =>
    {
        if(e.deltaX !== 0)e.preventDefault();
    }, {passive: false});

    container.addEventListener('scroll', (e) =>
    {
        if(scrollTimer != null)clearTimeout(scrollTimer);
        scrollTimer = setTimeout(alignCards, 200);
    });
});

function wheelEvent(event)
{
    if(wheelEvent.lock)
    {
        event.preventDefault();
        return;
    }
    wheelEvent.lock = true;

    let containerMaxScroll = Math.trunc(Math.abs((container.scrollWidth - container.clientWidth) - container.scrollLeft)) === 0;

    if(scrollTimer !== null) clearTimeout(scrollTimer);

    if(window.scrollY <= 2 && (!containerMaxScroll && event.deltaY > 0 || event.deltaY < 0))
    {
        //container.scrollBy(event.deltaY, 0);
        let scrollLeft = container.scrollLeft + (event.deltaY < 0 ? -cardWidth : cardWidth);

        $(".performer-container").animate({
            scrollLeft: scrollLeft
        }, 350, () => wheelEvent.lock = false);

        window.scrollTo(0, 0);
        event.preventDefault();
    }
    else wheelEvent.lock = false;

    //scrollTimer = window.setTimeout(alignCards, 250);
}

function alignCards() {
    $(".performer-container").animate({scrollLeft: Math.round($(".performer-container").scrollLeft()/cardWidth)*cardWidth}, 200);
}

function adjustContainerSize()
{
    cardWidth = $(window).width()*0.85;
    if(cardWidth > 300)cardWidth = 300;
    cardWidth += 40; //margin

    console.log(`${$(window).height()*0.45} ${cardWidth}`);

    let maxWidth = $(window).width()*0.8;
    if(maxWidth > 1540)maxWidth = 1540;
    let cardNumber = Math.trunc(maxWidth/cardWidth);
    if(cardNumber < 1)cardNumber = 1;
    container.style.width = `${(cardNumber*cardWidth)}px`;
}
