
function getTotalItemInCart()
{
    return new Promise(async (resolve, reject) =>
    {
        fetch200('/user/cart/tot_items').then(async response =>
        {
            resolve((await response.json()).tot);
        }).catch(() =>
        {
            let tempCart = getCookieValue('tempCart');
            if(!checkTempCartString(tempCart))tempCart = '';
            if(!tempCart)return 0;
            let list = tempCart.split(",");
            let total = 0;
            for(let item of list) total += Number.parseInt(item.split("-")[0]);

            resolve(total);
        });
    });
}

function setCookie(cookieName, value, expiresDate)
{
    let expires = expiresDate ? `;expires=${expiresDate.toUTCString()}` : "";
    document.cookie = `${cookieName}=${value};path=/${expires}`;
}

function getCookieValue(cookieName)
{
    let cookies = decodeURIComponent(document.cookie).split(";");
    for(let cookie of cookies)
    {
        if(cookie.trim().startsWith(cookieName))
        {
            let split = cookie.split("=");
            if(split.length > 0)return split[1];
            else return "";
        }
    }
    return undefined;
}

async function updateCartIcon()
{
    getTotalItemInCart().then(tot =>
    {
        let cartNumber = $('.navbar-cart-icon .cart-number');
        cartNumber.text(tot);
    });
}

function fetch200(path)
{
    return new Promise((resolve, reject) =>
    {
        fetch(path).then(response =>
        {
            if(response.status >= 400) reject(response);
            else resolve(response);
        }).catch(cause => reject(cause));
    });
}

function checkTempCartString(tempCart)
{
    return /(\d+-\w+)(,\d+-\w+)*/.test(tempCart);
}