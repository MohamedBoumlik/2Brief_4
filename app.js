const {render} = require('ejs');
const express = require('express');
const app = express();
const bodyparser = require('body-parser');


app.set('view engine','ejs');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));


// connection with DB
const mysql = require('mysql2');

const conn = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'root', 
    database : 'briefnodejs'
});

conn.connect((err) => {
    if(err) {
        throw err;
    }
    console.log('conected');

});


// Watching server
app.listen(3000);


// Images 
app.use(express.static('public'));


// ----------------- Routes -----------------

// ------ front Office ------

// index page
app.get('/',(req,res) => {
    let sql = 'SELECT * FROM vol';
    conn.query(sql,(err,data) => {
        if(err) throw err;
        res.render('index',{data});
    });
});

// reservation page
app.get('/booking/:id',(req,res) => {
    let fID = [req.params.id];
    // let sql = 'SELECT * FROM vol';
    // conn.query(sql,(err,data) => {
    //     if(err) throw err;
    // })
    res.render('reservation' ,{fID});
});

// save reservation
app.post('/saveReserv',(req,res) => {

    const name = req.body.name;
    const email = req.body.email;
    const tel = req.body.tel;
    const fId = req.body.fID;
    // console.log(fId);
    let sql = 'INSERT INTO reservation SET ?';

    conn.query(sql, {client_fName: name, email: email, tel: tel, vol_id: fId}, (err) => {
        if(err) throw err ;
        console.log('Reserved successfully');
        res.redirect('/');
    });

});


// ------ Back Office ------


// dash
app.get('/dash',(req,res) => {
    let sql = 'SELECT * FROM vol';
    conn.query(sql,(err,results) => {
        if(err) throw err;
        res.render('dash',{results});
    });
});

app.get('/add',(req,res) => {
    res.render('add_flight');
});

// adding flight
app.post('/addFlight',(req,res) => {

    const from = req.body.fCity;
    const toC = req.body.tCity;
    const place = req.body.places;
    const time = req.body.fTime;
    const date = req.body.fDate;

    let sql = 'INSERT INTO vol SET ?';
    conn.query(sql, { from_city: from, to_city: toC, places: place, flight_time: time, flight_date: date}, (err) => {
        if(err) throw err;
        console.log('flight added successflly');
        res.redirect('/dash');
    });
}); 

// delete flight
app.post('/deleteFlight/:id', (req,res) => {
    // console.log(req.params.id);
    let sql = 'DELETE FROM vol WHERE id = ?';
    conn.query(sql, [req.params.id],(err) => {
        if(err) throw err;
        console.log('flight deleted successfully');
        res.redirect('/dash');
    })
});

// 404
app.use((req,res) => {
    res.render('404');
});
