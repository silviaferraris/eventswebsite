let redirectTo;

async function login(noanim)
{
	let auth =
		{
			username: document.getElementById("username").value,
			password: document.getElementById("password").value,
			remember: document.getElementById("remember").checked,
			redirect_to: redirectTo
		};

	let options = {
		method: 'post',
		body: JSON.stringify(auth),
		headers: {'Content-Type': 'application/json'}
	};

	let response = await fetch('/user/login', options);

	if(response.redirected)window.location.href = response.url;

	if(response.status === 401)
	{
		if(!noanim)$("form").slideDown(500);
		$("#wrong-credential-alert").slideDown(200).delay(1000).slideUp(400);
	}
}

$(document).ready(function()
{
	redirectTo = getURLVariable('redirect_to');

	console.log(redirectTo);

	$("#send_btn").click(async () =>
	{
		let footerPos = $('footer').css('position');
		let noanim = footerPos === 'static'; /*In mobile view the scroll up and scroll down animation will not be executed*/

		let loginForm = document.getElementById("login-form");
		let valid = loginForm.checkValidity();
		if(!loginForm.classList.contains('was-validated'))loginForm.classList.add('was-validated');

		if(!valid) return;

		if(noanim)await login(noanim);
		else $("form").slideUp(500, () => login(noanim));
	});
});

function getURLVariable(variableName)
{
	let variables = window.location.search.substring(1).split('&');
	for(let variable of variables)
	{
		let pair = variable.split('=');
		if(pair[0] === variableName)return pair[1];
	}
	return undefined;
}