import cart from "/assets/js/modules/cart.mjs";

let imageLoaded = false;
let itemsMap = new Map();

$(()=>{
    let cardList = $(".cart-card-container ul");
    cart.getCartItems().then(items=>{

        let downloadImage = false;
        if(window.innerWidth > 610)downloadImage = true;

        cardList.html("");
        for (let item of items){
            let date = new Date(item.event.date);
            let dateString = `${date.getDate() < 10 ? '0' : ''}${date.getDate()}.${date.getMonth()+1 < 10 ? '0' : ''}${date.getMonth()+1}.${date.getFullYear()}`;

            let totalPrice = Number.parseFloat(item.event.price.substring(1, item.event.price.length-1))*item.quantity;

            let card = $(` <li class="card-cart">
                                <div class="item-image">
                                    <img alt="Cover Photo" class="loadingImage" src="/assets/images/icons/loading.svg">
                                </div>
                                <div class="description-cart">
                                    <h2 class="item-name">${item.event.title}</h2>
                                    <div class="item-subtitle"><h4 class="item-date">${dateString}</h4><span class="item-location">${item.event.location}</span></div>
                                    <div class="item-price-container">
                                        <span>Price per item:</span>
                                        <span class="item-price">${item.event.price}</span>
                                        <span>Total price:</span>
                                        <span class="item-total-price">$${totalPrice}</span>
                                    </div>
                                    <div class="remove-button-container">
                                        <span>Remove all from cart</span>
                                        <a class="removeall" data-eventId="${item.event.eventId}">
                                        <img alt="Delete item button" src="/assets/images/icons/delete-button.svg"></a>
                                    </div>
                                </div>
                                <div class="quantity" data-eventId="${item.event.eventId}">
                                    <a class="increase">+</a>
                                    <span class="quantity-item">${item.quantity}</span>
                                    <a class="decrease">-</a>
                                </div>
                          </li>`);

            cardList.append(card);

            if(downloadImage)
            {
                item.event.retrieveCoverImage().then(image => {
                    card.find(".item-image img").removeClass("loadingImage").attr("src",image);
                });
                imageLoaded = true;
            }
            else itemsMap.set(item, card);
        }
    });
});

let lockQuantityBtn = false;

$(document).on("click", ".increase", function ()
{
    if(lockQuantityBtn)return;
    lockQuantityBtn = true;
    let quantityContainer =  $(this).closest(".quantity");
    let eventId = quantityContainer.attr("data-eventId");
    cart.addToCart(eventId,1).then(()=>
    {
        let quantityItem = Number.parseInt(quantityContainer.find(".quantity-item").text())+1;
        quantityContainer.find(".quantity-item").text(quantityItem);
        lockQuantityBtn = false;
    }).catch(() => lockQuantityBtn = false);
});


$(document).on("click", ".decrease", function ()
{
    if(lockQuantityBtn)return;
    lockQuantityBtn = true;
    let quantityContainer =  $(this).closest(".quantity");
    let eventId = quantityContainer.attr("data-eventId");
    cart.removeFromCart(eventId,1).then(()=>
    {
        let quantityItem = Number.parseInt(quantityContainer.find(".quantity-item").text())-1;
        if (quantityItem <= 0) deleteCard(quantityContainer.parents(".card-cart"));
        else quantityContainer.find(".quantity-item").text(quantityItem);
        lockQuantityBtn = false;
    }).catch(() => lockQuantityBtn = false);
});

$(document).on("click", ".removeall", function () {
    let eventId = $(this).attr("data-eventId");
    cart.removeFromCart(eventId,"all").then(()=>
    {
        //$(this).parents(".card-cart").remove();
        deleteCard($(this).parents(".card-cart"));
    });
});

$(window).resize(() =>
{
    if(window.innerWidth > 610 && !imageLoaded){

        console.log('download...');

        for(let entry of itemsMap.entries())
        {
            console.log(entry)

            if(entry[1])
            {
                entry[0].event.retrieveCoverImage().then(image=>{
                    entry[1].find(".item-image img").removeClass("loadingImage").attr("src",image);
                    console.log('conver donwload');
                });
            }
            imageLoaded = true;
        }
    }
});

function deleteCard(card)
{
    card.animate({marginLeft: card.outerWidth()}, 200, () => card.remove());
}