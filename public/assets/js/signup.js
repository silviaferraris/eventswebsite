$(document).ready(() =>
{
    $("#submit-btn").click(async () =>
    {
        let form = document.getElementById("signup-form");

        let validForm = form.checkValidity();
        if(!form.classList.contains('was-validated'))form.classList.add('was-validated');
        let goodUsername = await isUsernameGood();

        if(validForm && !goodUsername)document.getElementById("username-up").setCustomValidity("Invalid field.");
        else if(validForm && goodUsername)form.submit();
    });

    $("#username-up").change(async () =>
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
    let response = await fetch(`/check_username?username=${username}`);
    return !(await response.json()).exist;
}