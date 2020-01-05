import cart from "/assets/js/modules/cart.mjs";

$(()=>{
    let cardList = $(".cart-card-container ul");
    cart.getCartItems().then(items=>{
        cardList.html("");
        for (let item of items){
            let date = new Date(item.event.date);
            let card = $(` <li class="card-cart">
                <div class="item-image">
                    <img class="loadingImage" src="/assets/images/icons/loading.svg">
                </div>
                <div class="description-cart">
                    <h2 class="item-name">${item.event.title}</h2>
                    <h4 class="item-date">${date.getDate()}-${date.getMonth()}-${date.getFullYear()}</h4>
                    <p class="item-location">${item.event.location}</p>
                    <span class="item-price">${item.event.price}</span>
                    <div style="display: flex"><span>Remove all from cart</span><a class="removeall">Remove</a></div>

                </div>
            <div class="quantity" data-eventId="${item.event.eventId}">
                <a class="increase">+</a>
                <span class="quantity-item">${item.quantity}</span>
                <a class="decrease">-</a>
            </div>
            </li>`);
            cardList.append(card);
            item.event.retrieveCoverImage().then(image=>{
                card.find(".item-image img").removeClass("loadingImage").attr("src",image);

            })
        }
    });
});

$(document).on("click", ".increase", function () {
    let quantityContainer =  $(this).closest(".quantity");
    let eventId = quantityContainer.attr("data-eventId");
    cart.addToCart(eventId,1).then(()=>
    {
        let quantityItem = Number.parseInt(quantityContainer.find(".quantity-item").text())+1;
        quantityContainer.find(".quantity-item").text(quantityItem);
    })
});


$(document).on("click", ".decrease", function () {
    let quantityContainer =  $(this).closest(".quantity");
    let eventId = quantityContainer.attr("data-eventId");
    cart.removeFromCart(eventId,1).then(()=>
    {
        let quantityItem = Number.parseInt(quantityContainer.find(".quantity-item").text())-1;
        if (quantityItem <= 0) quantityContainer.parents(".card-cart").remove();
        else quantityContainer.find(".quantity-item").text(quantityItem);
    })
})

$(document).on("click", ".removeall", function () {
    console.log("click");
    let quantityContainer =  $(this).closest(".quantity");
    let eventId = quantityContainer.attr("data-eventId");
    cart.removeFromCart(eventId,"all").then(()=>
    {
        $(this).parents(".card-cart").remove();
    })
})