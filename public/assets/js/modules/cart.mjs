function addToCart(eventId)
{
    return new Promise(async (resolve, reject) =>
    {
        if(!eventId)return reject();

        if(typeof addToCart.userLogged == 'undefined')
        {
            addToCart.userLogged = (await (await fetch('/user/imlogged')).json()).logged;
        }

        if(addToCart.userLogged)
        {
            await fetch(`/user/cart/add_event?event_id=${eventId}&quantity=1`);
            await updateCartIcon();
            return resolve();
        }
        else
        {
            let tempCart = getCookieValue('tempCart');
            tempCart = addToCartString(tempCart, eventId);
            setCookie('tempCart', tempCart);
            await updateCartIcon();
            resolve();
        }
    });

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

async function updateCartIcon()
{
    getTotalItemInCart().then(tot =>
    {
        let cartNumber = $('.navbar-cart-icon .cart-number');
        cartNumber.text(tot);
    });
}

export default {addToCart}