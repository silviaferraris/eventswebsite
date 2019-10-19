$(document).ready(function()
{
    let scrollPoint;

    $(".mobile-nav").load("/mobile-nav-menu.html", () =>
    {
        $("header").load("/navbar-new.html", () =>
        {
            $(document).scroll(function ()
            {
                let currentScrollPoint = $(this).scrollTop();

                if(currentScrollPoint > 0)
                {
                    if(!$(".sf-navbar").hasClass("white"))
                    {
                        $(".sf-navbar").addClass("white");
                        $("header").css("position", "fixed")
                    }
                }
                else
                {
                    $(".sf-navbar").removeClass("white");
                    $("header").css("position", "absolute")
                }

                if(currentScrollPoint > scrollPoint) //scrolling down
                {

                }
                else if(currentScrollPoint < scrollPoint) //scrolling up
                {

                }
            });
        });
    });

    $("#footer").load("/footer.html");
});