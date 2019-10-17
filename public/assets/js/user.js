class User
{
    constructor() {}

    static login(username, password, remember, redirectUrl)
    {
        return new Promise((resolve, reject) =>
        {
            let auth = {username: username, password: password, remember: remember, redirect_to: redirectUrl};

            let options = {
                method: 'post',
                body: JSON.stringify(auth),
                headers: {'Content-Type': 'application/json'}
            };

            fetch('/user/login', options).then(response => resolve(response)).catch(e => reject(e));
        });
    }

    static logout(redirectUrl)
    {

    }

    static userData()
    {
        return new Promise((resolve, reject) => fetch('/user/data').then(response => resolve(response)).catch(e => reject(e)));
    }

}