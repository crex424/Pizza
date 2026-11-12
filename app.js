// Import the express module
import express from 'express';

// Import mysql
import mysql2 from 'mysql2';

// Import .env
import dotenv from 'dotenv';
dotenv.config();

// Create a connection "pool"
const pool = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
}).promise();

// Create a instance of an
// express application
const app = express();

// Define port number
// for our server to listen on
const PORT = 3000;

// Enable static file serving
app.use(express.static('public'));


app.set('view engine', 'ejs');

// Create a route to test the database
app.get('/db-test', async(req,res) => {
    try {
        const orders = await pool.query('SELECT * FROM orders');
        res.send(orders[0]);
    } catch (err){
        console.error('Database error: ', err);
        res.status(500).send('Database error occurred.');
    }
});

// Create an array to store orders
const orders = [];

// Add "middleware" to allow the the app to parse data
// Access form data through req.body
app.use(express.urlencoded({extended: true}));

// Define a default route ("/")
app.get('/', (req, res) => {
    //res.send('Welcome to Poppa\'s Pizza');
    res.render('home');
});

// Add a contact route to display a contact view page
app.get('/contact-us', (req, res) => {
    res.render('contact')
});

// Add a confirm route to display a confirm view page
app.get('/confirm-order', (req, res) => {
    res.render('confirm')
});

// Add a confirm route to display a confirm view page
app.get('/menu', (req, res) => {
    res.render('menu')
});

// Add a route to process a pizza order
app.post('/submit-order', async(req, res) =>{
    // Create JSON object to store order data
    const order = req.body;

    console.log(order);

    // Define an SQL query to INSERT new order
    const sql = `INSERT INTO orders (fname, lname, email, size, method, toppings, comment) 
                    VALUES(?, ?, ?, ?, ?, ?, ?)`;
    // Create an array of parameters from order data
    const params = [
        order.fname,
        order.lname,
        order.email,
        order.size,
        order.method,
        order.toppings,
        order.comment
    ];

    // Execute the query
    const [result] = await pool.execute(sql, params);

    // Display the confirmation page
    res.render('confirm', {order})
});

// Add a admin route
app.get('/admin', async(req, res) => {
    try {
        const orders = await pool.query('SELECT * FROM orders');
        console.log(orders[0]);
        res.render('admin', { orders:orders[0] });

    } catch (err){
        console.error('Database error: ', err);
        res.status(500).send('Database error occurred.');
    }
})

// Start the server on the designated port
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});