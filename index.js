const express = require('express');
const cors  = require('cors');

const app = express();
app.use(cors());

//import endpoint diletakkan disini
//endpoint customer
const customer = require('./routes/customer');
app.use("/customer", customer)
//endpoint admin
const admin = require('./routes/admin')
app.use('/store/admin', admin)
const product = require('./routes/product')
app.use('/product', product)
app.listen(8080, () => {
    console.log("server run on port 8080");
})
