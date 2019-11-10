$(document).ready(() =>
{
    updateCartIcon();

    let mobileMenu = $(".mobile-nav");
    let mobileView = $(window).width() <= 890;

    $(window).resize(function ()
    {
        mobileView = ($(this).width() <= 890);
        if(!mobileView)
        {
            if(mobileMenu.hasClass("show"))
            {
                mobileMenu.removeClass("show");
                if($(".sf-dropdown-menu-mobile").hasClass("show"))
                {
                    $(".sf-dropdown-menu-mobile").removeClass("show");
                    $(".sf-dropdown-menu").addClass("show");
                    $(".sf-dropdown-toggle").addClass("toggled");
                }
            }
        }
        else{
            $(".sf-dropdown-menu").removeClass("show");
            $(".sf-dropdown-toggle").removeClass("toggled");
        }
    });


    $(".login-btn a").attr('href', `/login?redirect_to=${window.location.href}`);
    $(".nav-logout-btn").attr('href', `/user/logout?redirect_to=${window.location.href}`);

    $(".toggle-mobile-menu").on('click', () =>
    {
        if(!mobileMenu.hasClass("show"))mobileMenu.addClass("show");
    });

    $(".mobile-nav-exit-btn").click(() =>
    {
        mobileMenu.removeClass("show");
        $(".sf-dropdown-menu-mobile").removeClass("show");
        $(".sf-dropdown-toggle").removeClass("toggled");
    });


    $(".user-menu").hide();
    $("#nav-dashboard-btn").hide();
    $(".login-btn").hide();

    fetch('/user/data').then(async response =>
    {
        if(response.status === 401)
        {
            $(".login-btn").show();
            return;
        }

        let body = await response.json();

        $(".login-btn").hide();
        $(".user-menu").show();

        $(".navbarDropdownMenuLink img").attr('src', `/assets/images/default-avatars/avatar${body.avatar}.png`);
        $(".drop-down-avatar").attr('src', `/assets/images/default-avatars/avatar${body.avatar}.png`);
        $(".navbarDropdownMenuLink span").text(body.username);
        $(".drop-down-firstname-and-lastname").text(`${body.first_name} ${body.last_name}`);
        $(".drop-down-email").text(body.email);
        if(body.admin)$("#nav-dashboard-btn").show();

    }).finally(() => {

        let path = window.location.pathname;
        $('.sf-navbar-menu a[href="'+path+'"]').parent().addClass('active');
        $('.sf-navbar-menu-mobile a[href="'+path+'"]').parent().addClass('active');


        if(path.startsWith('/login') || path.startsWith('/signup'))
        {
            $(".login-btn").hide();
            $(".navbarDropdownMenuLink").hide();
        }
    });

    $(".sf-dropdown-toggle").on('click', function (event)
    {
        let destId = $(this).attr('data-destination');
        if(!destId)return;
        let dest = $(`#${destId}`);
        if(dest.hasClass("show"))
        {
            dest.addClass("hiding").removeClass("show").delay(500).queue(function () {
                $(this).removeClass("hiding").dequeue();
            });
        }
        else{
            dest.addClass("show");
        }
        //dest.toggleClass("show");
        $(this).toggleClass("toggled");
        event.preventDefault();
    });

    $(document).click((e) =>
    {
        if(!$(e.target).hasClass("sf-dropdown-toggle") && !$(e.target).parents().hasClass('sf-dropdown-toggle'))
        {
            $(".sf-dropdown-toggle").each(function () {
                if($(this).hasClass("toggled"))$(this).click();
            });
        }
    });
});