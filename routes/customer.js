//imoport express
const express = require('express'); //engine endpoint
const app = express(); //implementasi
app.use(express.json()) // read body

//import md5
const md5 = require('md5'); //enkripsi

const multer = require('multer');
const path = require('path');
const fs = require('fs'); //umntuk membaca file system

//import model
const models = require('../models/index')
const customer = models.customer

// config storage image
const storage = multer.diskStorage({
    destination:(req,file,cb) => {
        //cb = call back memanggil kembali
        cb(null, "./image/customer")
    },
    filename: (req,file,cb) => {
        cb(null, "cust-" + Date.now() + path.extname(file.originalname))
    }
})
let upload = multer({storage: storage})

//endpoint untuk menampilkan semua data customer
app.get("/", (req, res) =>{
    customer.findAll()
        .then(result => {
            res.json({
                customer: result
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })  
})
 
//endpoint untuk menampilkan semua data customer berdasarkan id
//GET CUSTOMER BY ID, METHOD:GET FUCNTION: FINDONE
app.get("/:customer_id", (req, res) =>{
    customer.findOne({ where: {customer_id: req.params.customer_id}})
    .then(result => {
        res.json({
            customer: result
        })
    })
    .catch(error => {
        res.json({
            message: error.message
        })
    })
})

//endpoint untuk menambahkan data customer baru

app.post("/", upload.single("image"), (req, res) =>{
    if (!req.file) {
        res.json({
            message: "No uploaded file"
        })
    } else {
        let data = {
            name: req.body.name,
            phone: req.body.phone,
            address: req.body.address,
            image: req.file.filename,
            username: req.body.username,
            password: md5(req.body.password)
        }
        customer.create(data)
        .then(result => {
            res.json({
                message: "data has been inserted"
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
    }
})

//endpoint untuk mengubah data customer berdasarkan id
app.put("/:id", upload.single("image"), (req, res) =>{
    let param = { customer_id: req.params.id}
    let data = {
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address,
        password: md5(req.body.password)
    }
    if (req.file) {
        // get data by id
        const row = customer.findOne({where: param})
        .then(result => {
            let oldFileName = result.image
           
            // delete old file
            let dir = path.join(__dirname,"../image/customer",oldFileName)
            fs.unlink(dir, err => console.log(err))
        })
        .catch(error => {
            console.log(error.message);
        })

        // set new filename
        data.image = req.file.filename
    }
    if(req.body.password){
        data.password = md5(req.body.password)
    }

    customer.update(data, {where: param})
        .then(result => {
            res.json({
                message: "data has been updated",
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})

// endpoint untuk menghapus data customer berdasarkan id
app.delete("/:id", async (req, res) =>{
    try {
        let param = { customer_id: req.params.id}
        let result = await customer.findOne({where: param})
        let oldFileName = result.image
           
        // delete old file
        let dir = path.join(__dirname,"../image/customer",oldFileName)
        fs.unlink(dir, err => console.log(err))
 
        // delete data
        customer.destroy({where: param})
        .then(result => {
           
            res.json({
                message: "data has been deleted",
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
 
    } catch (error) {
        res.json({
            message: error.message
        })
    }
})

module.exports = app