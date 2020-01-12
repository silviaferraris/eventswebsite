$(document).ready(() =>
{
    $('#signup-form').submit(async function (e) {

        e.preventDefault();

        let validForm = this.checkValidity();
        if(!$(this).hasClass('was-validated'))$(this).addClass('was-validated');
        let goodUsername = await isUsernameGood();

        if(validForm && !goodUsername)document.getElementById("username-up").setCustomValidity("Invalid field.");
        else if(validForm && goodUsername)
        {
            let cartString = getCookieValue('tempCart');
            if(cartString && cartString !== '' && checkTempCartString(cartString))
                $(this).append(`<input type="hidden" name="temp_cart" value="${cartString}" />`);

            this.submit();
        }

    });

    $("#username-up").on('input', async () =>
    {
        let goodUsername = await isUsernameGood();
        if(!goodUsername)
        {
            $("#username-feedback").text("This username already exist.");
            document.getElementById("username-up").setCustomValidity("Invalid field.");
        }
        else
        {
            $("#username-feedback").text("Please choose a username.");
            document.getElementById("username-up").setCustomValidity("");
        }
    });
});

async function isUsernameGood()
{
    let username = document.getElementById("username-up").value;
    let response = await fetch(`/user/check_username?username=${username}`);
    return !(await response.json()).exist;
}