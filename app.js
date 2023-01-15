const { urlencoded } = require('body-parser');
const express = require('express');
const {Client} = require('pg')  //postgres package
const rn = require('random-number');

//initialize app
const app = express();
app.listen(9500);
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

//Postgres connection
const client = new Client({
  host: 'localhost',
  user: 'postgres',
  password: 'admin',
  port: 5432,
  database: 'node_test'
})
client
  .connect()
  .then(() => console.log('Connected to Postgres Database "node-test".... '))
  .catch((err) => console.error('Failed to connect to postgres.....', err.stack))

///fetch data from postgres 'users' table
app.get('/', (req, res) => {
  client.query('SELECT * FROM users', (err, results) => {
  if (!err) {
    res.render('index', { results: results.rows }) 
  } else {
  console.log(err.message);
  }
  client.end;
  }) 
});

//adduser route
app.get('/adduser', (req, res) => {
  res.render('user')
})


//random# for ids
const options = {min: 31, max: 10000, integer: true}

//post to postgres database
app.post('/adduser', (req, res) => {
  const values = Object.values(req.body);
  values.unshift(rn(options));
  values.pop();
  const text = 'INSERT INTO users(id, first_name, last_name, gender, fav_color) VALUES ($1, $2, $3, $4, $5) RETURNING *'

  client.query(text, values)
    .then(res => console.log(res.rows[0].first_name, res.rows[0].last_name + " successfully added to 'users' database..."))
    .catch(e => console.log(e.message));

  res.redirect('/');  //redirect to table page
})


//delete from database
app.get('/:id', (req, res) => {
  const id = req.params.id;

  const text = `DELETE FROM users WHERE id = ${id} RETURNING *`;
  client
  .query(text)
  .then(res => {
    console.log(res.rows[0].first_name, res.rows[0].last_name + " successfully removed from 'users' database..." )
  })
  .catch(err => console.log(err.message))

  res.redirect('/');
})
