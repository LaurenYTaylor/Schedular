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
        response.send(tasks);
    })
    
});

// send task data
app.get('/load_cal_items', function(request, response){
    let query = "SELECT * FROM calendar_item WHERE user_id="+request.user.id;
    pool.query(query, function (err, result) {
        let cal_items = (result.rows);
        response.send(cal_items);
    })

});

app.get('/load_subtasks', function(request, response){
    let query = "SELECT * FROM subtasks WHERE user_id=" + request.user.id;
    console.log(query)
    pool.query(query, function(err, result) {
        let subtasks = (result.rows);
        response.send(subtasks);
    })
});

app.post('/new_task', async function(request, response) {
    let {name, category, duration, repeat, dueDate} = request.body;
    let query = "INSERT INTO todo_item (user_id, num_hours, category, completed, description, repeat, due_date) "
        + "VALUES (" + request.user.id + ", " + duration + ", '" + category + "', 'false', '" + name + 
        "','" +repeat + "', '" + dueDate + "');";


    let client = await pool.connect();

    await pool.query(query);

    query = "SELECT MAX(item_id) FROM todo_item WHERE user_id="+request.user.id
        + " AND num_hours=" + duration + " AND category='"+category+"' AND description='" + name + "';";

    let result = await pool.query(query);

    let max = result.rows[0].max;
    response.send(JSON.stringify(max));

    client.release();
});

app.post('/delete_task', async function(request, response) {
    let query_string = "DELETE FROM todo_item WHERE user_id="+request.user.id+" AND item_id="+request.body.taskid+";";
    let client = await pool.connect();
    pool.query(query_string);
    client.release();
});

app.post('/new_cal_task', async function (request, response) {
    let query_string = "INSERT INTO calendar_item (user_id, description, yyyymmdd, num_hours, start_time, end_time, category, parent_task_id, due_date, repeat) ";
    let item = request.body;
    let description=item.title;
    let category=item.cat;
    let numHours=2;
    if(item.duration) {
        numHours=item.duration/(60*60*1000);
    }
    let start=item.start;
    let end=item.end;
    let start_split = start.split('T');
    let end_split = end.split('T');
    let date=start_split[0];
    let startTime=start_split[1];
    let endTime=end_split[1];
    let parent = item.parent_task;
    let dueDate = item.due_date;
    let repeat = item.repeat;

    query_string+="VALUES ("+request.user.id+", '"+ description+"', '"+date+"', " +
        ""+numHours+", '"+startTime+"', '" +endTime+"', '"+category+"', "+parent+", '" + dueDate + "', '" +
    repeat +"');";
    let update_string = "UPDATE todo_item SET in_calendar='true' WHERE user_id="+
        request.user.id+" AND item_id='"+ parent +"';";
        console.log(update_string);
    console.log(query_string)    
    let client = await pool.connect();

    await pool.query(query_string);
    await pool.query(update_string);

    let id_finder = "SELECT MAX(item_id) FROM calendar_item WHERE user_id="+request.user.id
        + " AND parent_task_id="+parent+";";

    let result = await pool.query(id_finder);
    let max = result.rows[0].max;
    response.send(JSON.stringify(max));

    client.release();
});

app.post('/update_cal_task', function(request, response) {
    let start_split = request.body.start.split('T');
    let end_split = request.body.end.split('T');
    let date=start_split[0];
    let start_time=start_split[1];
    let end_time=end_split[1];
    let query_string = "UPDATE calendar_item SET start_time='"+start_time+
        "', end_time='"+end_time+"', yyyymmdd='"+date+"' WHERE item_id="+request.body.id+
        " AND user_id="+request.user.id+";";
    pool.connect(function(err, client) {
        pool.query(query_string);
        client.release();
    });
});

app.post('/remove_cal_task', function(request, response) {
    let id = request.body.id;
    let parent = request.body.parent_id;
    let delete_string = "DELETE FROM calendar_item WHERE item_id='"+id+"' AND user_id="+request.user.id+";";
    let update_string = "UPDATE todo_item SET in_calendar='"+false+"' WHERE user_id="+request.user.id+" AND item_id='"+
        +parent+"';"
    console.log(delete_string);
    pool.connect(function(err, client) {
        pool.query(delete_string);
        pool.query(update_string);
        client.release();
    });
});

//Morgan's code
app.post('/delete_cal_task', function(request, response) {
    let id = request.body.id;
    let parent = request.body.parent_id;
    //let subtask_delete = "DELETE FROM subtasks WHERE parent_task_id=" + id +
    //    "AND user_id=" + request.user.id + ";";
    let delete_string = "DELETE FROM calendar_item WHERE item_id='"+id+"' AND user_id="+request.user.id+";";
    console.log(delete_string);
    pool.connect(function(err, client) {
    //    pool.query(subtask_delete);
        pool.query(delete_string);
        client.release();
    });
});

app.post('/edit_cal_task', function(request, response){
    let id = request.body.id;
    let newName = request.body.newName;
    let dury = request.body.newDury;
    let cat = request.body.newCat;
    let end = request.body.end;
    let repeat = request.body.repeat;
    //let due = request.body.newDue;

    let query_string = "UPDATE calendar_item SET description='" + newName +
        "', num_hours='" + dury +"', category='" + cat +
        "', end_time='" + end + "', repeat='" + repeat + 
        "' WHERE item_id=" + id + " AND user_id=" + request.user.id + ";";
    console.log(query_string)
    pool.connect(function(err, client) {
        pool.query(query_string);
        client.release();
    })
});

app.post('/edit_task', function(request, response) {
    let id = request.body.id;
    let name = request.body.name;
    let dury = request.body.dury;
    let cat = request.body.cat;
    let repeat = request.body.repeat;
    let dueDate = request.body.dueDate;

    let query_string = "UPDATE todo_item SET description='" + name +
        "', num_hours='" + dury + "', category='" + cat +
        "', repeat='" + repeat + "', due_date='" + dueDate + "' WHERE item_id=" + id +
        " AND user_id=" + request.user.id + ";";
    console.log(query_string)
    pool.connect(function(err, client) {
        pool.query(query_string);
        client.release();
    })
});

app.post('/add_notes_files', function(request, response) {
    let id = request.body.id
    let note = request.body.note

    let query_string = "UPDATE calendar_item SET notes='" +
        note + "' WHERE item_id=" + id + " AND user_id=" +
        request.user.id + ";";
    console.log(query_string)
    pool.connect(function(err, client) {
        pool.query(query_string);
        client.release();
    })

});

app.post('/add_files', function(request, response) {
    let filename = request.body.filename
    let file = request.body.file
    console.log(file)
})

app.post('/add_subtask', async function(request, response) {
    let description = request.body.description;
    let parent = request.body.parent_id;
    let completed = request.body.completed;

    let query = "INSERT INTO subtasks (description, parent_task_id, completed, user_id)" +
        "VALUES('" + description + "', " + parent + ", '" + completed + "', " + request.user.id +");"
         console.log(query);

    let client = await pool.connect();

    await pool.query(query);

    let id_finder = "SELECT MAX(task_id) FROM subtasks WHERE "
        + "parent_task_id="+parent+";";

    let result = await pool.query(id_finder);
    let max = result.rows[0].max;
    console.log(max)
    response.send(JSON.stringify(max));

    client.release();

})


app.post('/event_complete', function(request, response) {
    let id = request.body.id;
    let complete = request.body.complete;

    let query = "UPDATE calendar_item SET complete='" + complete + 
        "' WHERE item_id=" + id + ";";

    console.log(query)
    pool.connect(function(err, client) {
        pool.query(query);
        client.release();
    })
})


http.listen(port, () => console.log("Listening on port " + port));

