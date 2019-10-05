async function login()
{
	let auth =
		{
			username: document.getElementById("username").value,
			password: document.getElementById("password").value
		};

	let options = {
		method: 'post',
		body: JSON.stringify(auth),
		headers: {'Content-Type': 'application/json'}
	};

	let response = await fetch('/login', options);

	if(response.redirected)window.location.href = response.url;

	if(response.status === 401)
	{
		$("form").slideDown(500);
	}
}

$(document).ready(function()
{
	$("#send_btn").click(() =>
	{
		$("form").slideUp(500, () => login());
	});
});