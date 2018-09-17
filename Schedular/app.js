const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 3001;
const pg = require("pg");
const bp = require("body-parser");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const http_cookie_parser = require("cookie-parser");

const pool = new pg.Pool({
    port: 5432,
    host: 'lauren-server.postgres.database.azure.com',
    user: 'admin_schedular@lauren-server',
    database: 'schedular',
    password: 'Password1'
});

const secret_key = "VQPBypb1-sGPPm4ol-ujCXE6rc-8v7dtEf5-fCragJdu-tenmf7vR-U2AsEET4-PU6Bs8QG";

app.use(express.static(__dirname+'/static/'));
app.use(bp.json());
app.use(bp.urlencoded({extended: true}));
app.use(http_cookie_parser());
app.use(handshake);

app.get('/', homepage);
function homepage(request, response) {
    response.sendFile(__dirname+'/static/homepage.html');
    socket.on("sign up clicked", function(request, response) {
        console.log("sign up clicked");
        response.sendFile(__dirname+'/static/sign_up.html');
    });
    socket.on("sign in clicked", function(request, response) {
        response.sendFile(__dirname+'/static/sign_in.html');
    });
}

app.get('/signup', function(request, response) {
    response.sendFile(__dirname+'/static/sign_up.html');
});

app.post('/signup', function(request, response) {
    let email_validation_key = crypto.randomBytes(128);
    email_validation_key = email_validation_key.toString('base64');
    console.log("validation_key: "+email_validation_key);
    bcrypt.hash(request.body.password, 10, function(err, hashed_password) {


        console.log("hpass: "+ hashed_password);


        let query_string = "INSERT INTO users (username, email, password, email_validation_key)";
        query_string += "VALUES ('"+request.body.username+"', '"+ request.body.email+"', '"+hashed_password+"', '"+email_validation_key+"')";

        pool.connect(function(err, result) {
            pool.query(query_string);
            response.send("you did it.");
        });
    });
});

app.get('/signin', function(request, response) {
    response.sendFile(__dirname+'/static/sign_in.html');
});

app.get('/schedular', function(request, response) {
    if(!request.user) response.redirect('/signin');
    response.sendFile(__dirname+'/static/calendar-ui.html');
});

// send task data
app.get('/tasks', function(request, response){
    let query = "SELECT description FROM todo_item";
    //let query_string = "INSERT INTO todo_item ("

    pool.query(query, function (err, result) {
        let tasks = (result.rows)
        console.log(tasks);
        response.send(tasks);
    })
    
});

app.post('/signin', function(request, response) {
    console.log(request.body);
    authenticate(request.body.username, request.body.password, function(err, jwt) {
        if(jwt) {
            response.cookie('jwt', jwt, { maxAge: 900000});
            response.redirect('/schedular');
        }
        else {
            response.send("you didnt do it.");
        }
    });
});
function authenticate(username, password, callback) {
    let query = "SELECT user_id, email, password FROM users WHERE username = '" + username + "'";
    pool.connect(function(err, result) {
        pool.query(query, async function(err, result) {
            if(result.rows.length > 0) {
                let match = await bcrypt.compare(password, result.rows[0].password);
                if(match) {
                    let user = {
                        id : result.rows[0]["user_id"],
                        name : username,
                        email : result.rows[0]["email"]
                    };
                    createSession(user, callback);
                } else {
                    callback(new Error("Oh nu!"));
                }
            }
        })
    })
}

function createSession(user, callback) {
    let session_key = crypto.randomBytes(64);
    user.session_key=session_key.toString('base64');
    let session_id = crypto.randomBytes(4);
    user.session_id=session_id.toString('base64');
    console.log(user.session_id);
    let query_string="INSERT INTO sessions (user_id, session_id, session_key) VALUES ('"+user.id+"','"+user.session_id+"','"+user.session_key+"');";
    pool.connect(function(err, result) {
        pool.query(query_string, function(err, result) {
            callback(null, jwt.sign(user, secret_key));
            console.log(err);
        });
    });
}


app.get('/', homepage);
function homepage(request, response) {
    response.sendFile(__dirname+'/static/homepage.html');
}

app.get('/schedular', function (request, response) {
    response.sendFile(__dirname+'/static/calendar-ui.html');
});



function handshake(request, response, next) {
    let cookie = request.cookies.jwt;
    if(cookie) {
        jwt.verify(cookie, secret_key, function(err, data) {
            query_string = "SELECT session_key from sessions where session_id='"+data.session_id+"';";
            pool.connect(function(err, result) {
                pool.query(query_string, function(err, result) {

                   if(result && result.rows.length > 0 && result.rows[0].session_key === data.session_key) {
                       request.user = data;
                   }

                   next();
                });

            })
        });
    }
    else next();
}

http.listen(port, () => console.log("Listening on port " + port));

