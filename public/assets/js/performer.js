import Performer from '../../assets/js/modules/performer.mjs'
//import Event from "../../assets/js/modules/event.mjs";

$(document).ready(() =>
{
    Performer.getAllPerformers().then(performers =>{
        for(let p of performers){
            console.log(p.photo);
        }
    })
});


let loadedPerformer = 0;

$(document).ready(() =>
{
    let lastScroll;
    let goUpBtn = $(".go-up-button");
    goUpBtn.hide();

    $(document).scroll(function ()
    {
        if($(window).width() < 990)
        {
            console.log("mob");
            if(lastScroll > $(this).scrollTop() && $(this).scrollTop() > 1000) goUpBtn.fadeIn(400);
            else if(lastScroll < $(this).scrollTop() || $(this).scrollTop() <= 1000) goUpBtn.fadeOut(400);
        }
        else
        {
            console.log("desk");
            if($(this).scrollTop() > 1000) goUpBtn.fadeIn(400);
            else goUpBtn.fadeOut(400);
        }

        lastScroll = $(this).scrollTop();
    });

    goUpBtn.on('click', function (event)
    {
        $("html,body").animate({
            scrollTop: $('html,body').offset().top
        }, 'slow');

        event.preventDefault();
    });


    loadPerformers(6);

    $(document).on('click', '.load-more-btn', function ()
    {
        loadPerformers(LoadPerformers+6, loadedPerformer, getCheckedTypes());
    });

    $(document).on('click', '#filter-form-apply-btn', function () {
        clearList().then(() => loadEvents(6, 0, getCheckedTypes()));
    });

    $(document).on('click', '.filter-form-title', function () {

        let container = $('.filter-form-sections-container');
        container.toggleClass('show');
        $('.filter-form-container').toggleClass("toggled");

        let newHeight = 0;
        if(container.hasClass("show")) newHeight = $('.filter-form-sections').height();

        container.animate({
            height: newHeight
        }, 400);
    });
});

function loadPerformers(limit, offset, types) {
    Event.getNextPerformer(limit, offset, types).then(events =>
    {
        let cardList = $(".card-list");
        createCards(events, cardList);
    });
}

function clearList()
{
    return new Promise(resolve => {
        $(".card-list-container").animate({height: 0}, () =>
        {
            $(".card-list").empty();
            loadedPerformer = 0;
            resolve();
        });
    })
}

function createCards(events, cardList)
{
    events.forEach(performers => createCard(performers, cardList));

    loadedPerformer += performers.length;

    let emptyMessage = $('.empty-list-message');
    if(loadedPerformer === 0)emptyMessage.addClass('show');
    else emptyMessage.removeClass('show');

    let height = $(".card-list").outerHeight();
    if(height < 20)height = 20;
    $(".card-list-container").animate({height: `${height}px`});

    //fadeInArray(cards[Symbol.iterator]()).then(() => console.log("a"));
}

function createCard(event, cardList)
{

    let card = $(`<div class="card-performer">
                                    <img class="cover-image" src="${performer.coverImage}">
                                    <div class="card-bottom">
                                        <h4 class="card-performer">${event.performerFirstName} ${event.performerLastName}</h4>
                                        </div>
                                    <div class="card-description-container">
                                        <span>i</span>
                                        <p class="card-description">${performer.description}</p>
                                    </div>
                                </div>`);//.css('visibility', 'hidden');
    cardList.append(card);
    return card;
}

function addToCartString(cartString, eventId)
{
    if(!checkTempCartString(cartString))cartString = '';
    if(!cartString || cartString === '')return `1-${eventId}`;
    let list = cartString.split(',');
    let newCartString = '';
    let found = false;
    for(let item of list)
    {
        let itemSplit = item.split('-');
        if(itemSplit[1] === eventId)
        {
            newCartString += `${Number.parseInt(itemSplit[0])+1}-${itemSplit[1]},`;
            found = true;
        }
        else newCartString += `${item},`;
    }
    if(!found)newCartString += `1-${eventId},`;
    return  newCartString.substring(0, newCartString.length-1);
}


function loadMorePerformers()
{
    let performerCards = [];
    for(let i = 0; i < 6; i++)
    {
        let card = $('<div class="card-performer"></div>').hide();
        eventCards.push(card);
        $(".card-list").append(card);
    }

    const iterator = performerCards[Symbol.iterator]();

    fadeInArray(iterator);
}

async function fadeInArray(iterator)
{
    let value = iterator.next().value;
    if(value === undefined)return;
    return fadeIn(value).then(() => fadeInArray(iterator));
}

function fadeIn(element)
{
    return new Promise((resolve, reject) =>
    {
        console.log(element);

        element.css('visibility', 'visible').hide().fadeIn(400);

        setTimeout(() =>
        {
            resolve();
        }, 100);
    });
}
