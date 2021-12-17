const {render} = require('ejs');
const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const fs = require('fs')
app.set('view engine','ejs');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));

// connection with DB
const mysql = require('mysql2');
// const { dirname } = require('path');

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
    let sql = 'SELECT * FROM vol WHERE vol.places<= 20';
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
        res.redirect('/ticket');
    });

});

// mail
app.get('/ticket', (req,res) => {

    let sql = 'SELECT reservation.id ,vol.from_city, vol.to_city, vol.flight_time, vol.flight_date, vol.places ,reservation.client_fName,reservation.tel FROM reservation, vol WHERE vol.id=reservation.vol_id AND reservation.id=(select max(id) from reservation)';
    
    conn.query(sql,(err,data) => {
        if(err) throw err;
        res.render('ticket',{data});
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'testcoding975@gmail.com',
                pass: 'testCoding1998'
            }
        });
        
        let mailOptions = {
    
            from: 'testcoding975@gmail.com', // TODO: email sender
            to: 'boumlik.mohamed.19@gmail.com', // TODO: email receiver
            subject: 'Booking Ticket',
            // text: 'ur ticket'
            // html: `hello ${data[0].client_fName}`
            // html:  ejs.render('ticket',{data})
            html:  ejs.render(fs.readFileSync('../2Brief_4/views/ticket.ejs','utf8'),{data})
        }
    
        transporter.sendMail(mailOptions, (err, data) => {
            if (err) throw err;
            
        });
        // console.log(data);
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

// booked
app.get('/book', (req,res) => {
    // let sql = 'SELECT * FROM reservation' ;
    let volSql = 'SELECT reservation.id ,vol.from_city, vol.to_city, vol.flight_time, vol.flight_date, vol.places ,reservation.client_fName,reservation.tel FROM reservation, vol WHERE vol.id=reservation.vol_id';
    conn.query(volSql, (err,result) => {
        if(err) throw err;
        res.render('book',{result});
    });
});

// delete book
app.post('/deleteBook/:id', (req,res) => {
    // console.log(req.params.id);
    let sql = 'DELETE FROM reservation WHERE id = ?';
    conn.query(sql, [req.params.id],(err) => {
        if(err) throw err;
        console.log('book deleted successfully');
        res.redirect('/book');
    })
});

// 404
app.use((req,res) => {
    res.render('404');
});
