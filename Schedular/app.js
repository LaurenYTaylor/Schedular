const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 3000;
const pg = require("pg");
const bp = require("body-parser");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const http_cookie_parser = require("cookie-parser");
const nodemailer = require('nodemailer');

const pool = new pg.Pool({
    port: 5432,
    host: 'sched-server.postgres.database.azure.com',
    user: 'admin_schedular@sched-server',
    database: 'schedular_db',
    password: 'Password1'
});
const secret_key = "VQPBypb1-sGPPm4ol-ujCXE6rc-8v7dtEf5-fCragJdu-tenmf7vR-U2AsEET4-PU6Bs8QG";

app.use(express.static(__dirname+'/static/'));
app.use(bp.json());
app.use(bp.urlencoded({extended: true}));
app.use(http_cookie_parser());
app.use(handshake);


function redirectToSchedular(request, response, next) {
    if(request.user) {
        return response.redirect('/schedular');
    }
    else next();
}

function authenticate(username, password, signup, callback) {
    let query = "SELECT user_id, email, password FROM users WHERE username = '" + username + "'";
    let match=false;
    pool.connect(function(err, result) {
        pool.query(query, async function(err, result) {
            if(result.rows.length > 0) {
                if(signup == false) {
                    match = await bcrypt.compare(password, result.rows[0].password);
                } else {
                    match = (password==result.rows[0].password);
                }
                if(match) {
                    let user = {
                        id : result.rows[0]["user_id"],
                        name : username,
                        email : result.rows[0]["email"]
                    };
                    createSession(user, callback);
                    io.set('authorization', function(handshake, callback) {
                        handshake.id=user.id;
                        handshake.name=user.name;
                        handshake.email=user.email;
                        callback(null, true);
                    });
                } else {
                    callback(new Error("password"));
                }
            } else {
                callback(new Error("username"));
            }
        });
    });
}

function createSession(user, callback) {
    let session_key = crypto.randomBytes(64);
    user.session_key=session_key.toString('base64');
    let session_id = crypto.randomBytes(4);
    user.session_id=session_id.toString('base64');
    console.log("session id: "+user.session_id);
    let query_string="INSERT INTO sessions (user_id, session_id, session_key) VALUES ('"+user.id+"','"+user.session_id+"','"+user.session_key+"');";
    pool.connect(function(err, result) {
        pool.query(query_string, function(err, result) {
            callback(null, jwt.sign(user, secret_key));
        });
    });
}

function handshake(request, response, next) {
    let cookie = request.cookies.jwt;
    if(cookie) {
        jwt.verify(cookie, secret_key, function(err, data) {
            query_string = "SELECT session_key from sessions where session_id='"+data.session_id+"';";
            pool.connect(function(err, client) {
                pool.query(query_string, function(err, result) {
                    client.release();
                    if(result && result.rows.length > 0 && result.rows[0].session_key === data.session_key) {
                        request.user = data;
                    }

                    next();
                });
            });
        });
    }
    else next();
}

app.get('/', redirectToSchedular, homepage);
function homepage(request, response) {
    response.render(__dirname + '/views/user/homepage.pug');
}

app.get('/signin', redirectToSchedular, function(request, response) {
    response.render(__dirname + '/views/user/sign_in.pug');
});

app.post('/signin', function(request, response) {
    authenticate(request.body.username, request.body.password, false, function(err, jwt) {
        if(jwt) {
            response.cookie('jwt', jwt, { maxAge: 86400000});
            response.redirect('/schedular');
        }
        else if (err.message=="username") {
            response.render(__dirname+'/views/user/sign_in.pug', {
                'error': 'Username is incorrect. Please try again.'
            });
        } else {
            response.render(__dirname+'/views/user/sign_in.pug', {
                'error': 'Password is incorrect. Please try again.'
            });
        }
    });
});

app.get('/signup', redirectToSchedular, function(request, response) {
    response.render(__dirname+'/views/user/sign_up.pug', );
});

app.post('/signup', function(request, response) {
    let email_validation_key = crypto.randomBytes(128);
    email_validation_key = email_validation_key.toString('base64');
    let username_check_query = "SELECT * FROM users WHERE username='"+request.body.username+"';";
    let email_check_query = "SELECT * FROM users WHERE email='"+request.body.email+"';";
    pool.connect(function(err, client) {
        pool.query(username_check_query, function (err, result) {
            if (result.rows.length > 0) {
                response.render(__dirname + '/views/user/sign_up.pug', {
                    'error': 'This username has been taken. Please try again.'
                });
            } else {
                pool.query(email_check_query, function(err, result) {
                    if(result.rows.length>0) {
                        response.render(__dirname+'/views/user/sign_up.pug', {
                            'error': 'An account already exists with this email. Please try again.'
                        });
                    } else {
                        bcrypt.hash(request.body.password, 10, function(err, hashed_password) {
                            let query_string = "INSERT INTO users (username, email, password, email_validation_key)";
                            query_string += "VALUES ('"+request.body.username+"', '"+ request.body.email+"', '"+hashed_password+"', '"+email_validation_key+"')";
                                pool.query(query_string, function(err, result) {
                                    let transporter = nodemailer.createTransport({
                                        service: 'hotmail',
                                        auth: {
                                            user: 'lauren.y.taylor@hotmail.com',
                                            pass: 'Hotmail.com2'
                                        }
                                    });
                                    let link = 'http://'+'localhost:'+port+"/email_validate"+"?email="+request.body.email+"&id="+email_validation_key;
                                    let mailOptions = {
                                        from: 'lauren.y.taylor@hotmail.com',
                                        to: request.body.email,
                                        subject: 'Schedular Validate Email',
                                        text: 'Please go to the following link to validate your email: '+link
                                    };
                                    transporter.sendMail(mailOptions, function(error, info) {
                                        if(error) {
                                            console.log(error);
                                        } else {
                                            console.log("email sent to "+request.body.email);
                                        }
                                    });
                                    response.redirect("/validate_email");
                            });
                        });
                    }
                });
            }
            client.release();
        });
    });

});

app.get('/email_validate', function(request, response) {
    let url = request.query;
    let email = url.email;
    let validation_key = url.id;
    let query_string = "SELECT email_validation_key from users where email='"+email+"';";
    pool.connect(function(err, client) {
        pool.query(query_string, function(err, result) {
            validation_key = validation_key.trim().replace(/ /g, "+");
            if(result.rows[0].email_validation_key == validation_key) {
                let user_id_find = "SELECT * FROM users WHERE email='"+email+"';";
                pool.query(user_id_find, function(err, user_info_result) {
                    authenticate(user_info_result.rows[0].username, user_info_result.rows[0].password,
                        true, function(err, jwt) {
                        if (jwt) {
                            response.cookie('jwt', jwt, {maxAge: 864000000});
                            let validated_true_query = "UPDATE users SET validated='true' WHERE user_id="+
                                user_info_result.rows[0].user_id+";";
                            pool.query(validated_true_query);
                            response.redirect('/schedular');
                        } else {
                            console.log("JWT didn't work :(");
                            response.redirect('/signin');
                        }
                    });
                });
            } else {
                response.redirect('/validate_email');
            }
        });
        client.release();
    });
});

app.get('/validate_email', function(request, response) {
    response.sendFile(__dirname+'/static/validate_email.html');
});

app.get('/schedular', function(request, response) {
    if(!request.user) response.redirect('/signin');
    response.sendFile(__dirname+'/static/calendar-ui.html');
});

app.get('/signout', function(request, response) {
    pool.connect(function(err, client) {
        pool.query(query_string, function(err, result) {
            client.release();
        });
    });
    response.clearCookie('jwt');
    response.redirect('/');
});

// send task data
app.get('/tasks', function(request, response){
    let query = "SELECT * FROM todo_item WHERE user_id="+request.user.id;


    pool.query(query, function (err, result) {
        let tasks = (result.rows);
        console.log(tasks);
        response.send(tasks);
    })
    
});

app.post('/new_task', function(request, response) {
    let query_string = "INSERT INTO todo_item (user_id, num_hours, category, completed, description, due_date, priority) ";
    let item = request.body;
    let description=item.name;
    let category=item.category;
    let numHours=item.duration;
    let dueDate = item.dueDate;
    let priority = item.priority;
    query_string += "VALUES ("+request.user.id+", "+ numHours+", '"+category+"', 'false', '"+description+"', '" + dueDate + "', '" + priority +"');";
    pool.connect(function(err, client) {
      pool.query(query_string, function(err, result) {
        client.release();
      });
    });
});

app.post('/delete_task', function(request, response) {
    let query_string = "DELETE FROM todo_item WHERE user_id="+request.user.id+" AND description='"+request.body.descript+"';";
     pool.connect(function(err, client) {
        pool.query(query_string, function(err, result) {
            client.release();
        });
    });
});

app.post('/new_cal_task', function (request, response) {
    let query_string = "INSERT INTO calendar_item (user_id, num_hours, category, completed, description) ";
    let item = request.body;
    let description=item.name;
    let category=item.category;
    let numHours=item.duration;
    let start=item.start;
    let end=item.end;
    console.log(item);
});

http.listen(port, () => console.log("Listening on port " + port));

