const express = require("express");
const app = express();
const admin = express();
const fs = require('fs');
const knex = require('knex');
const bodyParser = require('body-parser');
const passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
const session = require("express-session");
const md5 = require('md5');
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

const hashKey = 'lavagna';

const _404pagePath = 'public/pages/404/404.html';

const USER_TABLE = 'users';
const EVENTS_TABLE = 'events';
const SEMINARS_TABLE = 'seminars';
const PERFORMERS_TABLE = 'performers';
const USERS_EVENTS_TABLE = "UsersEvents";
const EVENTS_IMAGES_TABLE = 'EventsImages';
const EVENTS_SEMINAR_TABLE = 'EventsSeminars';
const SEMINARS_IMAGES_TABLE = 'SeminarsImages';

let EVENT_TYPES = [];

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

        let user = await db(USER_TABLE).select("*").where({username: username, password: hashPassword(password)}).catch(reason =>
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

//############################################# APP PARAMETERS ################################################//

app.param('event_id', async (req, res, next, value) =>
{
    if(!await isEventIdExisting(value))return send404Page(res);
    req.event_id = value;
    next();
});

app.param('seminar_id', async (req, res, next, value) =>
{
    if(!await isSeminarIdExisting(value))return send404Page(res);
    req.seminar_id = value;
    next();
});

app.param('performer_id', async (req, res, next, value) =>
{
    if(!await isPerformerIdExisting(value))return send404Page(res);
    req.performer_id = value;
    next();
});

//############################################# APP ROUTES ###################################################//

app.post('/user/login', (req, res, next) =>
{
    passport.authenticate('local', function(err, user, info)
    {
        if (err) return next(err);

        if (!user)return res.status(401).send({message : info});

        let redirectTo = req.body.redirect_to ? req.body.redirect_to : '/';

        req.login(user, err =>
        {
            if (err) next(err);
            if(req.body.remember) req.session.cookie.expires = 315360000000; /*10 years*/
            else req.session.cookie.expires = undefined;
            return res.redirect(301, redirectTo);
        });
    })(req, res, next);
});

/*app.get('/login', (req, res) =>
{
    redirectIfLogged(req, res, '/', 'public/pages/login/index.html');
});

app.get('/signup', (req, res) =>
{
    redirectIfLogged(req, res, '/', 'public/pages/signup/index.html');
});*/

app.get('/user/logout', (req, res) =>
{
    let redirectTo = req.query.redirect_to ? req.query.redirect_to : '/';
    req.logout();
    res.redirect(redirectTo);
});

app.get('/user/imlogged', (req, res) =>
{
    if(req.user)res.send(JSON.stringify({logged: true}));
    else res.send(JSON.stringify({logged: false}));
});

app.get('/user/check_username', async (req,res) =>
{
    res.send(JSON.stringify({exist: await isUsernameAlreadyExisting(req.query.username)}));
});

app.post('/user/add_new', async (req, res) =>
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
            password: hashPassword(body.password),
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

app.get('/user/data', (req, res) =>
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

app.get('/user/cart/add_event', async (req, res) =>
{
    if(!req.user)return res.status(401).end();

    if(!(await isEventIdExisting(req.query.event_id)))return res.status(400).end();

    db(USERS_EVENTS_TABLE).insert({user_id: req.user.id, event_id: req.query.event_id}).then(result => res.status(204).end()).catch(cause => sendError500(res, cause));
});

app.get('/user/cart/remove_event', (req, res) =>
{
    if(!req.user)return res.status(401).end();

    if(!req.query.event_id)return res.status(400).end();

    db(USERS_EVENTS_TABLE).where({user_id: req.user.id, event_id: req.query.event_id}).del().then(result => res.status(204).end()).catch(cause => sendError500(res, cause));
});

app.get('/user/cart/clear', (req, res) =>
{
    if(!req.user)return res.status(401).end();
    db(USERS_EVENTS_TABLE).where({user_id: req.user.id}).del().then(result => res.status(204).end()).catch(cause => sendError500(res, cause));
});

app.get('/events/all', (req, res) =>
{
    db(EVENTS_TABLE).select('*').then(result => res.send(JSON.stringify(result))).catch(cause => sendError500(res, cause));
});

app.get('/events/next_date', (req, res) =>
{
    db(EVENTS_TABLE).first('date').orderBy('date').where('date', '>=', parseDateForDB(new Date())).then(result =>
    {
        let found = false;
        if(result.date)found = true;
        res.send(JSON.stringify({found: found, date: result.date}));
    }).catch(cause => sendError500(res, cause));
});

app.get('/events/types', (req, res) =>
{
    res.send(JSON.stringify(EVENT_TYPES));
});

app.get('/events/by_type', (req, res) =>
{
    db(EVENTS_TABLE).select('*').where({type: req.query.type}).then(result => res.send(JSON.stringify(result))).catch(cause => sendError500(res, cause));
});

app.get('/events/on_date', (req, res) =>
{
    let date = req.query.date;
    db(EVENTS_TABLE).select('*').where({date: date}).then(result => res.send(JSON.stringify(result))).catch(cause => sendError500(res, cause));
});

app.get('/events/of_seminar', (req, res) =>
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
               sendError500(res, e);
           }
       }
       res.send(JSON.stringify(events));
   }).catch(cause => sendError500(res, cause));
});

app.get('/events/of_performer', (req, res) =>
{
    let performer_id = req.query.performer_id;
    db(EVENTS_TABLE).select('*').where({performer_id: performer_id}).then(result => JSON.stringify(result)).catch(cause => sendError500(res, cause));
});

app.get('/events/:event_id', (req, res) =>
{
    res.cookie('eveid', req.event_id);
    sendPage(res, 'public/pages/events/event.html', 200);
});

app.get('/events/next_events/:limit(\\d+|all)', (req, res) =>
{
    let limit = req.params.limit  === 'all' ? Number.MAX_SAFE_INTEGER : Number.parseInt(req.params.limit);
    db(EVENTS_TABLE).select('*').where('date', '>=', parseDateForDB(new Date())).orderBy('date').limit(limit).then(result => res.send(JSON.stringify(result))).catch(cause => sendError500(res, cause));
});

app.get('/events/:event_id/data', (req, res) =>
{
    db(EVENTS_TABLE).select('*').where({id: req.event_id}).then(result =>
    {
        if(result.length === 0)return res.status(404).end();
        res.send(JSON.stringify(result[0]))
    }).catch(cause => sendError500(res, cause));
});

app.get('/events/:event_id/images/:range(\\d+-\\d+|all)', async (req, res) =>
{
    let offset = req.params.range === 'all' ? 0 : Number.parseInt(req.params.range.split('-')[0]);
    let limit = req.params.range === 'all' ? Number.MAX_SAFE_INTEGER : Number.parseInt(req.params.range.split('-')[1])+1;

    db(EVENTS_IMAGES_TABLE).select('image').where({event_id: req.event_id}).orderBy('id').offset(offset).limit(limit).then(result => res.send(JSON.stringify(result))).catch(cause => sendError500(res, cause));
});

app.get('/events/:event_id/on_same_date', (req, res) =>
{
    db(EVENTS_TABLE).select('date').where({id: `${req.event_id}`}).then(result =>
    {
        if(result.length === 0)return res.send(JSON.stringify([]));
        let date = parseDateForDB(result[0].date);

        db(EVENTS_TABLE).select('*').where({date: date}).whereNot({id: req.event_id}).then(events =>
        {
            res.send(JSON.stringify(events));
        }).catch(cause => sendError500(res, cause))
    }).catch(cause => sendError500(res, cause));
});

app.get('/seminars/all', (req, res) =>
{
    db(SEMINARS_TABLE).select('*').then(result => res.send(JSON.stringify(result))).catch(cause => sendError500(res, cause));
});

app.get('/seminars/next_date', (req, res) =>
{
    db(SEMINARS_TABLE).first('date').orderBy('date').where('date', '>=', parseDateForDB(new Date())).then(result =>
    {
        let found = false;
        if(result.date)found = true;
        res.send(JSON.stringify({found: found, date: result.date}));
    }).catch(cause => sendError500(res, cause));
});

app.get('/seminars/of_event', (req, res) =>
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
                sendError500(res, e);
            }
        }
        res.send(JSON.stringify(seminars));
    }).catch(cause => sendError500(res, cause));
});

app.get('/seminars/on_date', (req, res) =>
{
    let date = req.query.date;
    db(SEMINARS_TABLE).select('*').where({date: date}).then(result => res.send(JSON.stringify(result))).catch(cause => sendError500(res, cause));
});

app.get('/seminars/of_performer', (req, res) =>
{
    let performer_id = req.query.performer_id;
    db(SEMINARS_TABLE).select('*').where({performer_id: performer_id}).then(result => JSON.stringify(result)).catch(cause => sendError500(res, cause));
});

app.get('/seminars/:seminar_id/on_same_date', (req, res) =>
{
    db(SEMINARS_TABLE).select('date').where({id: req.seminar_id}).then(result =>
    {
        if(result.length === 0)return res.send(JSON.stringify([]));
        let date = parseDateForDB(result[0].date);

        db(SEMINARS_TABLE).select('*').where({date: date}).whereNot({id: req.seminar_id}).then(events =>
        {
            res.send(JSON.stringify(events));
        }).catch(cause => sendError500(res, cause))
    }).catch(cause => sendError500(res, cause));
});

app.get('/seminars/next_seminars/:limit(\\d+|all)', (req, res) =>
{
    let limit = req.params.limit  === 'all' ? Number.MAX_SAFE_INTEGER : Number.parseInt(req.params.limit);
    db(SEMINARS_TABLE).select('*').where('date', '>=', parseDateForDB(new Date())).orderBy('date').limit(limit).then(result => res.send(JSON.stringify(result))).catch(cause => sendError500(res, cause));
});

app.get('/seminars/:seminar_id', (req, res) =>
{
    res.cookie('semid', req.seminar_id);
    sendPage(res, 'public/pages/seminars/seminar.html', 200);
});

app.get('/seminars/:seminar_id/data', (req, res) =>
{
    db(SEMINARS_TABLE).select('*').where({id: req.seminar_id}).then(result =>
    {
        if(result.length === 0)return res.status(404).end();
        res.send(JSON.stringify(result[0]));
    }).catch(cause => sendError500(res, cause));
});

app.get('/seminars/:seminar_id/images/:range(\\d+-\\d+|all)', async (req, res) =>
{
    let offset = req.params.range === 'all' ? 0 : Number.parseInt(req.params.range.split('-')[0]);
    let limit = req.params.range === 'all' ? Number.MAX_SAFE_INTEGER : Number.parseInt(req.params.range.split('-')[1])+1;

    db(SEMINARS_IMAGES_TABLE).select('image').where({seminar_id: req.seminar_id}).orderBy('id').offset(offset).limit(limit).then(result => res.send(JSON.stringify(result))).catch(cause => sendError500(res, cause));
});

app.get('/performers/all', (req, res) =>
{
    db(PERFORMERS_TABLE).select('*').then(result => res.send(JSON.stringify(result))).catch(cause => sendError500(res, cause));
});

app.get('/performers/of_seminar', (req, res) =>
{
    let seminar_id = req.query.seminar_id;
    db(SEMINARS_TABLE).select('performer_id').where({id: seminar_id}).then(result =>
    {
        if(result.length === 0)return res.status(404).end();

        db(PERFORMERS_TABLE).select('*').where({id: result[0].performer_id}).then(result =>
        {
            if(result.length === 0)return res.status(404).end();
            res.send(JSON.stringify(result[0]));
        }).catch(cause => sendError500(res, cause));
    }).catch(cause => sendError500(res, cause));
});

app.get('/performers/of_event', (req, res) =>
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

app.get('/performers/:performer_id', (res, req) =>
{
    res.cookie('perid', req.performer_id);
    sendPage(res, 'public/pages/performers/performer.html', 200);
});

app.get('/performers/:performer_id/data', (req, res) =>
{
    db(PERFORMERS_TABLE).select('*').where({id: req.performer_id}).then(result =>
    {
        if(result.length === 0)return res.status(404).end();
        res.send(JSON.stringify(result[0]));
    }).catch(cause => sendError500(res, cause))
});


//############################################# END APP ROUTES ################################################//

//############################################# ADMIN ROUTES #################################################//

admin.post('/event/add_new', async (req, res) =>
{
    let body = req.body;

    if(!(body.id && body.title && body.description && body.date && body.performer_id && body.event_type && body.price && body.location)) return res.status(400).send("missing data");
    if(body.price < 0)return res.status(400).send("price can't be negative!");
    if(await isEventIdExisting(body.id)) return res.status(400).send(`event ${id} already exist!`);
    if(!(await isPerformerIdExisting(body.performer_id)))return res.status(400).send(`performer ${body.performer_id} does not exist!`);
    if(!EVENT_TYPES.includes(body.event_type))return res.status(400).send(`invalid event type: ${body.event_type}`);

    let images_number = body.images ? body.images.length : 0;

    db.transaction(trx => {

        let event_data = {
            id: body.id,
            title: body.title,
            description: body.description,
            date: body.date,
            performer_id: body.performer_id,
            type: body.event_type,
            cover_image: body.cover_image,
            price: body.price,
            location: body.location,
            images_number: images_number
        };

        return trx(EVENTS_TABLE).insert(event_data).then(() =>
        {
            if(images_number === 0)return;
            let values = [];
            body.images.forEach(image => values.push({event_id: body.id, image: image}));
            return trx(EVENTS_IMAGES_TABLE).insert(values);
        });
    }).then(result => res.status(201).end()).catch(reason => {
        console.log(reason);
        res.status(500);
        res.send(JSON.stringify(reason));
    });
});

admin.post('/seminar/add_new', async (req, res) =>
{
    let body = req.body;

    if(!(body.id && body.title && body.description && body.date && body.performer_id && body.location && body.event_ids.length > 0)) return res.status(400).send("missing data");
    if(await isSeminarIdExisting(body.id)) return res.status(400).send(`seminar ${id} already exist!`);
    if(!(await isPerformerIdExisting(body.performer_id)))return res.status(400).send(`performer ${body.performer_id} does not exist!`);
    for(let event_id of body.event_ids) if(!(await isEventIdExisting(event_id))) return res.status(400).send(`event ${event_id} does not exist!`);

    let images_number = body.images ? body.images.length : 0;

    db.transaction(trx =>
    {
        let seminar_data = {
            id: body.id,
            title: body.title,
            description: body.description,
            date: body.date,
            performer_id: body.performer_id,
            cover_image: body.cover_image,
            location: body.location,
            images_number: images_number
        };

        return trx(SEMINARS_TABLE).insert(seminar_data).then(() =>
        {
            let values = [];
            for(let event_id of body.event_ids) values.push({event_id: event_id, seminar_id: body.id});

            return trx(EVENTS_SEMINAR_TABLE).insert(values).then(() => {
                if(images_number === 0)return;
                let values = [];
                body.images.forEach(image => values.push({seminar_id: body.id, image: image}));
                return trx(SEMINARS_IMAGES_TABLE).insert(values);
            });
        });

    }).then(() => res.status(201).end()).catch(reason =>
    {
        console.log(reason);
        res.status(500);
        res.send(JSON.stringify(reason));
    });
});

admin.post('/performer/add_new', async (req, res) =>
{
    let body = req.body;

    if(!(body.id && body.first_name && body.last_name && body.biography)) return res.status(400).send("missing data");
    if(await isPerformerIdExisting(body.id)) return res.status(400).send(`performer ${id} already exist!`);

    db(PERFORMERS_TABLE).insert(
        {
            id: body.id,
            first_name: body.first_name,
            last_name: body.last_name,
            biography: body.biography,
            photo: body.photo
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

admin.get('/performer/check_id', (req, res) =>
{
    checkID(PERFORMERS_TABLE, req.query.performer_id, res);
});

//############################################# END ADMIN ROUTES ##############################################//



app.get("*", (req, res) =>
{
   send404Page(res);
});

init().then(() =>
{
    app.listen(port, () =>
    {
        console.log(`Server started on port ${port}`);
    });
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

function send404Page(response)
{
    if(!fs.existsSync(_404pagePath))response.status(404).end();
    else sendPage(response, _404pagePath, 404);
}

function sendError500(response, cause) {
    console.error(cause);
    response.status(500).end();
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

async function isEventIdExisting(event_id)
{
    let result = await db(EVENTS_TABLE).select("*").where({id: event_id});
    return !(result.length === 0);
}

async function isSeminarIdExisting(seminar_id)
{
    let result = await db(SEMINARS_TABLE).select("*").where({id: seminar_id});
    return !(result.length === 0);
}

async function isPerformerIdExisting(performer_id)
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

function sendPage(res, pagePath, status)
{
    if(!fs.existsSync(pagePath))
    {
        send404Page(res);
        return;
    }
    fs.readFile(pagePath, (err, data) =>
    {
        if(err)return res.status(500).end();
        res.writeHead(status, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
    });
}

function redirectIfLogged(req, res, redirectTo, elsePath)
{
    disablePageCache(res);
    if(!elsePath.startsWith('/'))elsePath = `/${elsePath}`;
    if(req.user)return res.redirect(301, redirectTo);
    sendPage(res, `${__dirname}${elsePath}`, 200);
}

function parseDateForDB(date)
{
    date = new Date(date);
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
}

async function init()
{
    try
    {
        let types = await db.select('pg_enum.enumlabel').from('pg_type').join('pg_enum', 'pg_enum.enumtypid', '=', 'pg_type.oid').where({'pg_type.typname':'event_type'});
        for(let type of types) EVENT_TYPES.push(type.enumlabel);
        Object.freeze(EVENT_TYPES);
    } catch (e) {
        console.error(e);
        process.exit(-1);
    }
}

function hashPassword(password)
{
    return md5(`${hashKey}${md5(password)}`);
}

function removeId(json)
{
    delete json.id;
    return json;
}

function removeIds(jsonArray)
{
    for(let json of jsonArray)delete json.id;
    return jsonArray;
}
