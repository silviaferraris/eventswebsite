import Event from "/assets/js/modules/event.mjs"

class CartItem {
    constructor (event,quantity){
        this._event = event;
        this._quantity = quantity;
    }
    get event(){
        return this._event;
    }
    get quantity(){
        return this._quantity;
    }
}

function addToCart(eventId, quantity)
{
    return new Promise(async (resolve, reject) =>
    {
        if(!eventId)return reject();

        if(!quantity)quantity = '1';
        else
        {
            try {Number.parseInt(quantity);}
            catch (e) {return reject();}
        }

        if(typeof addToCart.userLogged == 'undefined')
        {
            addToCart.userLogged = (await (await fetch('/user/imlogged')).json()).logged;
        }

        if(addToCart.userLogged)
        {
            await fetch(`/user/cart/add_event?event_id=${eventId}&quantity=${quantity}`);
            await updateCartIcon();
            return resolve();
        }
        else
        {
            let tempCart = getCookieValue('tempCart');
            tempCart = addToCartString(tempCart, eventId, quantity);
            setCookie('tempCart', tempCart);
            await updateCartIcon();
            resolve();
        }
    });

}
function getCartItems() {

    return new Promise(async(resolve,reject)=>{
        if(typeof getCartItems.userLogged == 'undefined')
        {
            getCartItems.userLogged= (await (await fetch('/user/imlogged')).json()).logged;
        }
        let eventArray = [];
        if (getCartItems.userLogged) {
            let response= await fetch200("/user/cart");
            let response_json = await response.json();
            for(let item of response_json){
                let event = new Event(item.event_id);
                await event.fetchData(true);
                eventArray.push(new CartItem(event, item.quantity));
            }
            resolve(eventArray);
        }
        else {
            let tempCart = getCookieValue('tempCart');
            let stringSplit = tempCart.split(",");
            for (let item of stringSplit){
                let itemSplit = item.split("-");
                let event = new Event(itemSplit[1]);
                await event.fetchData(true);
                eventArray.push(new CartItem(event, itemSplit[0]));
            }
            resolve(eventArray);
        }
    })

}
function removeFromCart(eventId, quantity)
{
    return new Promise(async (resolve, reject) =>
    {
        if(!eventId)return reject();

        if(!quantity)quantity = '1';
        else if(quantity !== 'all')
        {
            try {Number.parseInt(quantity);}
            catch (e) {return reject();}
        }

        if(typeof removeFromCart.userLogged == 'undefined')
        {
            removeFromCart.userLogged = (await (await fetch('/user/imlogged')).json()).logged;
        }

        if(addToCart.userLogged)
        {
            await fetch(`/user/cart/remove_event?event_id=${eventId}&quantity=${quantity}`);
            await updateCartIcon();
            return resolve();
        }
        else
        {
            let tempCart = getCookieValue('tempCart');
            tempCart = removeFromCartString(tempCart, eventId, quantity);
            setCookie('tempCart', tempCart);
            await updateCartIcon();
            resolve();
        }
    });
}

function removeFromCartString(cartString, eventId, quantity)
{
    if(!checkTempCartString(cartString))cartString = '';
    if(!cartString || cartString === '')return '';
    let list = cartString.split(',');
    let newCartString = '';
    for(let item of list)
    {
        let itemSplit = item.split('-');
        if(itemSplit[1] === eventId)
        {
            if(quantity === 'all')continue;
            let remain = Number.parseInt(itemSplit[0])-quantity;
            if(remain > 0)newCartString += `${remain}-${itemSplit[1]},`;
        }
        else newCartString += `${item},`;
    }
    return  newCartString.substring(0, newCartString.length-1);
}

function addToCartString(cartString, eventId, quantity)
{
    if(!checkTempCartString(cartString))cartString = '';
    if(!cartString || cartString === '')return `${quantity}-${eventId}`;
    let list = cartString.split(',');
    let newCartString = '';
    let found = false;
    for(let item of list)
    {
        let itemSplit = item.split('-');
        if(itemSplit[1] === eventId)
        {
            newCartString += `${Number.parseInt(itemSplit[0])+quantity}-${itemSplit[1]},`;
            found = true;
        }
        else newCartString += `${item},`;
    }
    if(!found)newCartString += `${quantity}-${eventId},`;
    return  newCartString.substring(0, newCartString.length-1);
}

async function updateCartIcon()
{
    getTotalItemInCart().then(tot =>
    {
        let cartNumber = $('.navbar-cart-icon .cart-number');
        cartNumber.text(tot);
    });
}

export default {addToCart, removeFromCart, getCartItems}

