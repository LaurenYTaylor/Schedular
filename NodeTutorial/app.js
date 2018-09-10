const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 3000;
const pg = require("pg");

const pool = new pg.Pool({
    port: 5432,
    host: 'lauren-server.postgres.database.azure.com',
    user: 'admin_schedular@lauren-server',
    database: 'schedular',
    password: 'Password1'
});


app.use(express.static("static"));

app.get('/', homepage);

function homepage(request, response) {
    response.sendFile(__dirname+'/static/homepage.html');
}


io.on('connection', newConn);
function newConn(socket) {
    console.log("A user connected yay");
    socket.on("handshake", function(message) {
        console.log(message);
        socket.emit("handshake reply", "C'est bien de vous recontrer.")
    });
    socket.on("personal greeting", function(message) {
        console.log(message)
    });
    socket.on("get users", function() {
        pool.connect(function (err, result) {
            pool.query('SELECT * from users', function (err, result){
                console.log(err);
                socket.emit("send users", result);
            });
            console.log(err);
        });
    });
}


http.listen(port, () => console.log("Listening on port " + port));

