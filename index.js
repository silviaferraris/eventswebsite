const express = require("express");
const app = express();
const knex = require('knex');
const bodyParser = require('body-parser');
const passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
const session = require("express-session");
const port = process.env.PORT || 3000;
const db = knex({
    client: 'pg',
    version: '7.2',

    connection: {
        ssl: true,
        host : 'ec2-54-247-177-254.eu-west-1.compute.amazonaws.com',
        user : 'dvxxzuzactmfkm',
        password : '5afe1d8ed21b862c0c1b1a716bd09cc142b28e260256aae1d9ea8ebd6cec3baf',
        database : 'deudf3nt0i7irb'
    }
});

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(express.static("public/pages"));

app.use(session(
    {
    secret: 'secret',
    name: 'session',
    proxy: true,
    resave: true,
    saveUninitialized: false
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(async (username, password, done) =>
    {

        let user = await db('users').select("*").where({username: username, password: password}).catch(reason =>
        {
            done(reason);
        });

        if(user !== undefined && user.length === 1)return done(null, user[0]);
        return done(null, false, {message : 'Invalid credentials'});
    }
));

passport.serializeUser((user, done) =>
{
    done(null, user.username);
});

passport.deserializeUser(async (username, done) =>
{
    let user = await db('users').select("*").where({username: username});
    //TODO Handle possible errors (with middleware error handling function)
    done(null, user[0]);
});

app.post('/login', (req, res, next) =>
{
    passport.authenticate('local', function(err, user, info)
    {
        if (err) return next(err);

        if (!user)return res.status(401).send({message : info});

        req.login(user, err =>
        {
            if (err) next(err);
            return res.redirect(301, '/');
        });
    })(req, res, next);
});

app.get('/logout', (req, res) =>
{
    req.logout();
    res.redirect('/');
});

app.get('/user', (req, res) =>
{
    if(req.user)
    {
        let userData =
            {
                username: req.user.username,
                name: req.user.name,
                surname: req.user.surname,
                email: req.user.email,
                avatar: req.user.avatar
            };

        res.send(JSON.stringify(userData));
    }
    else res.status(401).end();
});

app.get('/imlogged', (req, res) =>
{
    if(req.user)res.send("YESSS :)");
    else res.send("No :(");
});

app.get('/checkUsername', async (req,res) =>
{
    if(await checkUsername(req.query.username)) res.status(200).send("username already exist!");
    else res.status(404).end();
});

app.get('/related', (req, res) =>
{
    db("users").select("*").where({username: req.query.username}).then(users =>
    {
        console.log(users);
        res.send(JSON.stringify(users));
    });

});

app.post('/register', async (req, res) =>
{
    let body = req.body;

    if(!body.date)body.date = null;

    if(!(body.username && body.name && body.surname && body.email && body.password && body.email)) {
        res.status(400).send("missing data");
        return;
    }

    if(await checkUsername(body.username)) {
        res.status(400).send(`username ${body.username} already exist`);
        return;
    }

    db("users").insert(
        {
            username: body.username,
            name: body.name,
            surname: body.surname,
            email: body.email,
            password: body.password,
            date: body.date,
            avatar: 1+Math.floor(Math.random() * 8)
        }
    ).then(result =>
    {
        res.redirect("/login");
    }).catch(reason =>
    {
        console.log(reason);
        res.status(500);
        res.send(JSON.stringify(reason));
    });

});

app.get("*", (req, res) =>
{
   res.status(404).end();
});

app.listen(port, () =>
{
    console.log(`Server started on port ${port}`);
});



/**
 *
 * @param username The username to check
 * @returns {Promise<boolean>} Return true if the username exist in the database
 */
async function checkUsername(username)
{
    let result = await db("users").select("*").where({username: username});
    return !(result.length === 0);
}
