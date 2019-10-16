const express = require("express");
const app = express();
const admin = express();
const fs = require('fs');
const shell = require('shelljs');
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

const ASSETS_PATH = `${__dirname}/public/assets`;
const STORAGE_PATH = `${__dirname}/public/storage`;
const EVENT_IMAGES_PATH = `${STORAGE_PATH}/images/events`;
const SEMINAR_IMAGES_PATH = `${STORAGE_PATH}/images/seminars`;
const PERFORMER_IMAGES_PATH = `${STORAGE_PATH}/images/performers`;

const USER_TABLE = 'users';
const EVENTS_TABLE = 'events';
const SEMINARS_TABLE = 'seminars';
const PERFORMERS_TABLE = 'performers';
const EVENTS_SEMINAR_TABLE = 'EventsSeminars';

init();

app.use(session(
    {
    secret: 'secret',
    name: 'session',
    proxy: true,
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: false }));
app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(async (username, password, done) =>
    {

        let user = await db(USER_TABLE).select("*").where({username: username, password: password}).catch(reason =>
        {
            done(reason);
        });

        if(user !== undefined && user.length === 1)return done(null, user[0]);
        return done(null, false, {message : 'Invalid credentials'});
    }
));

passport.serializeUser((user, done) =>
{
    done(null, user.id);
});

passport.deserializeUser(async (id, done) =>
{
    let user = await db(USER_TABLE).select("*").where({id: id});
    //TODO Handle possible errors (with middleware error handling function)
    done(null, user[0]);
});

app.use('/admin', admin);

admin.use('/', (req, res, next) =>
{
    if(req.user && req.user.admin)next();
    else res.status(403).end();
});

app.use('/pages/', (req, res, next) =>
{
    res.status(403).end();
});

app.use(express.static("public"));
app.use(express.static("public/pages"));

//############################################# APP ROUTES ###################################################//

app.post('/login', (req, res, next) =>
{
    passport.authenticate('local', function(err, user, info)
    {
        if (err) return next(err);

        if (!user)return res.status(401).send({message : info});

        req.login(user, err =>
        {
            if (err) next(err);
            if(req.body.remember) req.session.cookie.expires = 315360000000; /*10 years*/
            else req.session.cookie.expires = undefined;
            return res.redirect(301, '/');
        });
    })(req, res, next);
});

app.get('/login', (req, res) =>
{
    redirectIfLogged(req, res, '/', 'public/pages/login/index.html');
});

app.get('/signup', (req, res) =>
{
    redirectIfLogged(req, res, '/', 'public/pages/signup/index.html');
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
                first_name: req.user.first_name,
                last_name: req.user.last_name,
                email: req.user.email,
                birthday: req.user.birthday,
                avatar: req.user.avatar,
                admin: req.user.admin
            };

        res.send(JSON.stringify(userData));
    }
    else res.status(401).end();
});

app.get('/event/all', (req, res) =>
{
    db(EVENTS_TABLE).select('*').then(result => res.send(JSON.stringify(result))).catch(cause =>
    {
        console.error(cause);
        res.status(500).end();
    });
});

app.get('/event/by_id', (req, res) =>
{
    db(EVENTS_TABLE).select('*').where({id: req.query.event_id}).then(result =>
    {
        if(result.length === 0)return res.status(404).end();
        res.send(JSON.stringify(result[0]))
    }).catch(cause =>
    {
        console.error(cause);
        res.status(500).end();
    });
});

app.get('/event/on_date', (req, res) =>
{
    let date = req.query.date;
    db(EVENTS_TABLE).select('*').where({date: date}).then(result => res.send(JSON.stringify(result))).catch(cause =>
    {
        console.error(cause);
        res.status(500).end();
    });
});

app.get('/event/on_same_date', (req, res) =>
{
    let event_id = req.query.event_id;

    db(EVENTS_TABLE).select('date').where({id: `${event_id}`}).then(result =>
    {
        if(result.length === 0)return res.send(JSON.stringify([]));
        let date = parseDateForDB(result[0].date);

        db(EVENTS_TABLE).select('*').where({date: date}).whereNot({id: event_id}).then(events =>
        {
            res.send(JSON.stringify(events));
        }).catch(cause => {
            console.error(cause);
            res.status(500).end();
        })
    }).catch(cause =>{
        console.error(cause);
        res.status(500).end();
    });
});

app.get('/event/of_seminar', (req, res) =>
{
   let seminar_id = req.query.seminar_id;

   db(EVENTS_SEMINAR_TABLE).select('event_id').where({seminar_id: seminar_id}).then(async result1 =>
   {
       if(result1.length === 0)return res.send(JSON.stringify([]));
       let events = [];

       for(let eventId of result1)
       {
           try
           {
               let result2 = await db(EVENTS_TABLE).select('*').where({id: eventId.event_id});
               if(result2.length !== 0) events.push(result2[0]);
           }
           catch (e)
           {
               console.error(e);
               res.status(500).end();
           }
       }
       res.send(JSON.stringify(events));
   }).catch(cause =>{
       console.error(cause);
       res.status(500).end();
   });
});

app.get('/event/of_performer', (req, res) =>
{
    let performer_id = req.query.performer_id;
    db(EVENTS_TABLE).select('*').where({performer_id: performer_id}).then(result => JSON.stringify(result)).catch(cause =>
    {
        console.error(cause);
        res.status(500).end();
    });
});


/*app.get('/event/related', (req, res) =>
{
    let event_id = req.query.event_id;

    db(EVENTS_TABLE).select('tags').where({id: event_id}).then(result =>
    {
        db(EVENTS_TABLE).select('*').whereRaw(`find_in_set()`)
    }).catch(cause =>
    {
        console.error(cause);
        res.status(500).end();
    });
});*/

app.get('/seminar/all', (req, res) =>
{
    db(SEMINARS_TABLE).select('*').then(result => res.send(JSON.stringify(result))).catch(cause => {
        console.error(cause);
        res.status(500).end();
    });
});

app.get('/seminar/by_id', (req, res) =>
{
   let seminar_id = req.query.seminar_id;
   db(SEMINARS_TABLE).select('*').where({id: seminar_id}).then(result =>
   {
      if(result.length === 0)return res.status(404).end();
      res.send(JSON.stringify(result[0]));
   }).catch(cause =>
   {
       console.error(cause);
       res.status(500).end();
   });
});


app.get('/seminar/of_event', (req, res) =>
{
    let event_id = req.query.event_id;

    db(EVENTS_SEMINAR_TABLE).select('seminar_id').where({event_id: event_id}).then(async result1 =>
    {
        if(result1.length === 0)return res.send(JSON.stringify([]));
        let seminars = [];

        for(let seminarId of result1)
        {
            try
            {
                let result2 = await db(SEMINARS_TABLE).select('*').where({id: seminarId.seminar_id});
                if(result2.length !== 0) seminars.push(result2[0]);
            }
            catch (e)
            {
                console.error(e);
                res.status(500).end();
            }
        }
        res.send(JSON.stringify(seminars));
    }).catch(cause =>{
        console.error(cause);
        res.status(500).end();
    });
});

app.get('/seminar/on_same_date', (req, res) =>
{
    let seminar_id = req.query.seminar_id;

    db(SEMINARS_TABLE).select('date').where({id: seminar_id}).then(result =>
    {
        if(result.length === 0)return res.send(JSON.stringify([]));
        let date = parseDateForDB(result[0].date);

        db(SEMINARS_TABLE).select('*').where({date: date}).whereNot({id: seminar_id}).then(events =>
        {
            res.send(JSON.stringify(events));
        }).catch(cause => {
            console.error(cause);
            res.status(500).end();
        })
    }).catch(cause =>
    {
        console.error(cause);
        res.status(500).end();
    });
});

app.get('/seminar/on_date', (req, res) =>
{
    let date = req.query.date;
    db(SEMINARS_TABLE).select('*').where({date: date}).then(result => res.send(JSON.stringify(result))).catch(cause =>
    {
        console.error(cause);
        res.status(500).end();
    });
});

app.get('/seminar/of_performer', (req, res) =>
{
    let performer_id = req.query.performer_id;
    db(SEMINARS_TABLE).select('*').where({performer_id: performer_id}).then(result => JSON.stringify(result)).catch(cause =>
    {
        console.error(cause);
        res.status(500).end();
    });
});

app.get('/performer/all', (req, res) =>
{
    db(PERFORMERS_TABLE).select('*').then(result => res.send(JSON.stringify(result))).catch(cause =>
    {
        console.error(cause);
        res.status(500).end();
    });
});

app.get('/performer/by_id', (req, res) =>
{
    let performer_id = req.query.performer_id;
    db(PERFORMERS_TABLE).select('*').where({id: performer_id}).then(result =>
    {
        if(result.length === 0)return res.status(404).end();
        res.send(JSON.stringify(result[0]));
    }).catch(cause =>
    {
        console.error(cause);
        res.status(500).end();
    })
});

app.get('/performer/of_seminar', (req, res) =>
{
    let seminar_id = req.query.seminar_id;
    db(SEMINARS_TABLE).select('performer_id').where({id: seminar_id}).then(result =>
    {
        if(result.length === 0)return res.status(404).end();

        db(PERFORMERS_TABLE).select('*').where({id: result[0].performer_id}).then(result =>
        {
            if(result.length === 0)return res.status(404).end();
            res.send(JSON.stringify(result[0]));
        }).catch(cause =>
        {
            console.error(cause);
            res.status(500).end();
        });
    }).catch(cause =>
    {
        console.error(cause);
        res.status(500).end();
    });
});

app.get('/performer/of_event', (req, res) =>
{
    let event_id = req.query.event_id;
    db(EVENTS_TABLE).select('performer_id').where({id: event_id}).then(result =>
    {
        db(PERFORMERS_TABLE).select('*').where({id: result[0].performer_id}).then(result =>
        {
            if(result.length === 0)return res.status(404).end();
            res.send(JSON.stringify(result[0]));
        }).catch(cause =>
        {
            console.error(cause);
            res.status(500).end();
        });
    }).catch(cause =>
    {
        console.error(cause);
        res.status(500).end();
    });
});

app.get('/imlogged', (req, res) =>
{
    if(req.user)res.send(JSON.stringify({logged: true}));
    else res.send(JSON.stringify({logged: false}));
});

app.get('/check_username', async (req,res) =>
{
    res.send(JSON.stringify({exist: await isUsernameAlreadyExisting(req.query.username)}));
});

app.post('/register', async (req, res) =>
{
    let body = req.body;

    if(!body.birthday)body.birthday = null;

    if(!(body.username && body.first_name && body.last_name && body.password && body.email)) {
        res.status(400).send("missing data");
        return;
    }

    if(await isUsernameAlreadyExisting(body.username)) {
        res.status(400).send(`username ${body.username} already exist`);
        return;
    }

    db(USER_TABLE).insert(
        {
            username: body.username,
            email: body.email,
            password: body.password,
            first_name: body.first_name,
            last_name: body.last_name,
            birthday: body.birthday,
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

//############################################# END APP ROUTES ################################################//

//############################################# ADMIN ROUTES #################################################//

admin.post('/event/add_new', async (req, res) =>
{
    let body = req.body;

    if(!(body.id && body.title && body.description && body.date && body.performer_id)) return res.status(400).send("missing data");
    if(await isEventIdAlreadyExisting(body.id)) return res.status(400).send(`event ${id} already exist!`);

    if(!(await isPerformerIdAlreadyExisting(body.performer_id)))return res.status(400).send(`performer ${body.performer_id} does not exist!`);

    let dirPath = `${EVENT_IMAGES_PATH}/event_${body.id}`;
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);

    let imageCount = body.images.length;
    let hasCoverImage = false;

    for(let i = 0; i < imageCount; i++)
    {
        let img = body.images[i].replace(/^data:image\/\w+;base64,/, '');
        fs.writeFile(`${dirPath}/img${i}.jpg`, img, 'base64', function(err) {
            if(err)console.log(err);
        });
    }

    if(body.cover_image)
    {
        hasCoverImage = true;
        let coverImage = body.cover_image.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFile(`${dirPath}/cover.jpg`, coverImage, 'base64', function(err) {
            if(err)console.log(err);
        });
    }

    db(EVENTS_TABLE).insert(
        {
            id: body.id,
            title: body.title,
            description: body.description,
            date: body.date,
            performer_id: body.performer_id,
            tags: body.tags,
            has_cover_image: hasCoverImage,
            images_number: imageCount
        }
    ).then(result => res.status(201).end()).catch(reason => {
        console.log(reason);
        res.status(500);
        res.send(JSON.stringify(reason));
    });
});

admin.post('/seminar/add_new', async (req, res) =>
{
    let body = req.body;

    if(!(body.id && body.title && body.description && body.date && body.performer_id && body.event_ids.length > 0)) return res.status(400).send("missing data");
    if(await isSeminarIdAlreadyExisting(body.id)) return res.status(400).send(`seminar ${id} already exist!`);

    if(!(await isPerformerIdAlreadyExisting(body.performer_id)))return res.status(400).send(`performer ${body.performer_id} does not exist!`);

    for(let event_id of body.event_ids)
    {
        if(!(await isEventIdAlreadyExisting(event_id))) return res.status(400).send(`event ${event_id} does not exist!`);
    }

    let dirPath = `${SEMINAR_IMAGES_PATH}/seminar_${body.id}`;
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);

    let imageCount = body.images.length;
    let hasCoverImage = false;

    for(let i = 0; i < imageCount; i++)
    {
        let img = body.images[i].replace(/^data:image\/\w+;base64,/, '');
        fs.writeFile(`${dirPath}/img${i}.jpg`, img, 'base64', function(err) {
            if(err)console.log(err);
        });
    }

    if(body.cover_image)
    {
        hasCoverImage = true;
        let coverImage = body.cover_image.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFile(`${dirPath}/cover.jpg`, coverImage, 'base64', function(err) {
            if(err)console.log(err);
        });
    }

    db(SEMINARS_TABLE).insert(
        {
            id: body.id,
            title: body.title,
            description: body.description,
            date: body.date,
            performer_id: body.performer_id,
            has_cover_image: hasCoverImage,
            images_number: imageCount
        }
    ).then(result =>
    {
        let values = [];
        for(let event_id of body.event_ids) values.push({event_id: event_id, seminar_id: body.seminar_id});

        db(EVENTS_SEMINAR_TABLE).insert(values).then(() => res.status(201).end()).catch(reason =>
        {
            console.log(reason);
            res.status(500);
            res.send(JSON.stringify(reason));
        });

    }).catch(reason => {
        console.log(reason);
        res.status(500);
        res.send(JSON.stringify(reason));
    });
});

admin.post('/performer/add_new', async (req, res) =>
{
    let body = req.body;

    if(!(body.id && body.first_name && body.last_name && body.biography)) return res.status(400).send("missing data");
    if(await isPerformerIdAlreadyExisting(body.id)) return res.status(400).send(`performer ${id} already exist!`);

    let dirPath = `${PERFORMER_IMAGES_PATH}/performer_${body.id}`;
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);

    if(body.photo)
    {
        let photo = body.photo.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFile(`${dirPath}/photo.jpg`, photo, 'base64', function(err) {
            if(err)console.log(err);
        });
    }

    db(PERFORMERS_TABLE).insert(
        {
            id: body.id,
            first_name: body.first_name,
            last_name: body.last_name,
            biography: body.biography
        }
    ).then(result => res.status(201).end()).catch(reason => {
        console.log(reason);
        res.status(500);
        res.send(JSON.stringify(reason));
    });
});

admin.get('/event/check_id', (req, res) =>
{
    checkID(EVENTS_TABLE, req.query.event_id, res);
});

admin.get('/seminar/check_id', (req, res) =>
{
    checkID(SEMINARS_TABLE, req.query.seminar_id, res);
});

//############################################# END ADMIN ROUTES ##############################################//



app.get("*", (req, res) =>
{
   res.status(404).end();
});


app.listen(port, () =>
{
    console.log(`Server started on port ${port}`);
});

//############################################# FUNCTIONS ##############################################//

/**
 *
 * @param username The username to check
 * @returns {Promise<boolean>} Return true if the username exist in the database
 */
async function isUsernameAlreadyExisting(username)
{
    let result = await db(USER_TABLE).select("*").where({username: username});
    return !(result.length === 0);
}

function checkID(table, id, res)
{
    db(table).select('*').where({id: id}).then(result => {
        res.send(JSON.stringify({exist: result.length !== 0}));
    }).catch(cause =>{
        console.error(cause);
        res.status(500).end();
    });
}

async function isEventIdAlreadyExisting(event_id)
{
    let result = await db(EVENTS_TABLE).select("*").where({id: event_id});
    return !(result.length === 0);
}

async function isSeminarIdAlreadyExisting(seminar_id)
{
    let result = await db(SEMINARS_TABLE).select("*").where({id: seminar_id});
    return !(result.length === 0);
}

async function isPerformerIdAlreadyExisting(performer_id)
{
    let result = await db(PERFORMERS_TABLE).select("*").where({id: performer_id});
    return !(result.length === 0);
}

function disablePageCache(res)
{
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
}

function sendPage(res, pagePath)
{
    fs.readFile(pagePath, (err, data) =>
    {
        if(err)return res.status(500).end();
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
    });
}

function redirectIfLogged(req, res, redirectTo, elsePath)
{
    disablePageCache(res);
    if(!elsePath.startsWith('/'))elsePath = `/${elsePath}`;
    if(req.user)return res.redirect(301, redirectTo);
    sendPage(res, `${__dirname}${elsePath}`);
}

function parseDateForDB(date)
{
    date = new Date(date);
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
}

function init()
{
    createFolder(EVENT_IMAGES_PATH);
    createFolder(SEMINAR_IMAGES_PATH);
    createFolder(PERFORMER_IMAGES_PATH);
}

function createFolder(path)
{
    if(!fs.existsSync(path))shell.mkdir('-p', path);
}
