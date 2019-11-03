import Event from "../../assets/js/modules/event.mjs";

$(document).ready(() =>
{
    let loadedEvents = 0;
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

    $(document).on('click', '.card-buy', function (event)
    {
        addToCart($(this).attr('href'));

        let priceElement = $(this).parent().find($('.card-price'));
        let price = priceElement.text();
        let btnY = priceElement.offset().top - $(window).scrollTop();
        let btnX = priceElement.offset().left - $(window).scrollLeft();

        let bubble = $(`<div class="bubble"><span>${price.split('.')[0]}</span></div>`);
        bubble.css('top', btnY);
        bubble.css('left', btnX);

        $('body').append(bubble);

        moveBubbleToCart(bubble);

        event.preventDefault();
    });

    Event.getNextEvents(6).then(events =>
    {
        let cardList = $(".card-list");
        loadedEvents += events.length;
        createCards(events, cardList);
    });

    $(document).on('click', '.load-more-btn', function ()
    {
        Event.getNextEvents(loadedEvents+6, loadedEvents).then(events =>
        {
            let cardList = $(".card-list");
            loadedEvents += events.length;
            createCards(events, cardList);
        });
    });
});

function createCards(events, cardList)
{
    //let cards = [];
    events.forEach(async event =>
    {
        let price = event.price.split('.');
        if(price.length > 0 && price[1] === '00')price = price[0];
        else price = event.price;

        let performer = await event.getPerformer();
        let card = $(`<div class="event-card">
                                    <img class="cover-image" src="${event.coverImage}">
                                    <div class="card-bottom">
                                        <h1 class="card-title">${event.title}</h1>
                                        <h4 class="card-performer">${performer.firstName} ${performer.lastName}</h4>
                                        <a class="card-open" href="/events/${event.eventId}">More info</a>
                                        <div class="card-price-buy">
                                            <span class="card-price">${price}</span>
                                            <a class="card-buy" href="${event.eventId}">Buy</a>
                                        </div>
                                    </div>
                                    <div class="card-description-container">
                                        <span>i</span>
                                        <p class="card-description">${event.description}</p>
                                    </div>
                                </div>`).hide();
        cardList.append(card);
        //cards.push(card);
        fadeIn(card);
    });
    //fadeInArray(cards[Symbol.iterator]()).then(() => console.log("a"));
}

async function addToCart(eventId)
{
    if(!eventId)return;

    if(typeof addToCart.userLogged == 'undefined')
    {
        addToCart.userLogged = (await (await fetch('/user/imlogged')).json()).logged;
    }

    if(addToCart.userLogged)
    {
        fetch(`/user/cart/add_event?event_id=${eventId}&quantity=1`).then(updateCartIcon)
    }
    else
    {
        let tempCart = getCookieValue('tempCart');
        tempCart = addToCartString(tempCart, eventId);
        setCookie('tempCart', tempCart);
        await updateCartIcon();
    }
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

async function moveBubbleToCart(bubble)
{
    let toX = bubble.offset().left -  $('.sf-navbar .navbar-cart-icon').offset().left;
    let toY = bubble.offset().top - $('.sf-navbar .navbar-cart-icon').offset().top;

    bubble.animate({left: `-=${toX}`, top: `-=${toY}`}, 1000, () =>
    {
        bubble.animate({opacity: 0}, 300, () => bubble.remove());
    });
}

function loadMoreEvents()
{
    let eventCards = [];
    for(let i = 0; i < 6; i++)
    {
        let card = $('<div class="event-card"></div>').hide();
        eventCards.push(card);
        $(".card-list").append(card);
    }

    const iterator = eventCards[Symbol.iterator]();

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
        element.fadeIn(400);
        setTimeout(() =>
        {
            resolve();
        }, 100);
    });
}