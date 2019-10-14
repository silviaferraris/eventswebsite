$(document).ready(function()
{
    let scrollPoint;

    $("#navbar").load("/navbar.html", () =>
    {
        $(document).scroll(function ()
        {
            let currentScrollPoint = $(this).scrollTop();

            if(currentScrollPoint > 850)
            {
                if(!$("#navbar nav").hasClass("small-fixed")) $("#navbar nav").addClass("small-fixed");
            }
            else
            {
                $(".small-fixed").removeClass("small-fixed");
            }

            if(currentScrollPoint > scrollPoint) //scrolling down
            {

            }
            else if(currentScrollPoint < scrollPoint) //scrolling up
            {

            }
        });
    });
    $("#footer").load("/footer.html");
});