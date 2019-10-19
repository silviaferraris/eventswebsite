$(document).ready(() =>
{
    $(".login-btn a").attr('href', `/login?redirect_to=${window.location.href}`);
    $(".nav-logout-btn").attr('href', `/user/logout?redirect_to=${window.location.href}`);

    let mobileMenu = $(".mobile-nav");

    $(".toggle-mobile-menu").on('click', () =>
    {
        if(!mobileMenu.hasClass("show"))mobileMenu.addClass("show");
    });

    $(".mobile-nav-exit-btn").click(() =>
    {
        mobileMenu.removeClass("show");
    });


    $(".navbarDropdownMenuLink").hide();
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
        $(".navbarDropdownMenuLink").show();

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
        $(`#${destId}`).toggleClass("show");
        $(this).toggleClass("toggled");
        event.preventDefault();
    });
});