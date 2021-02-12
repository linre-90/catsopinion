// require
const express = require("express");
const request = require("request");
const dotenv = require("dotenv");
const MongoClient = require("mongodb").MongoClient;
const { ObjectID } = require("bson");
//const fs = require("fs");
const ejs = require("ejs").renderFile;
const Keygrip = require("keygrip");
const path = require("path");
const rateLimit = require("express-rate-limit");
// non server stuff
let Cat = require("./Cat");
let DataModder = require("./DataModder");

// security
const helmet = require("helmet");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const csurf = require("csurf");
const cookieSession = require("cookie-session");
const joi = require("joi");
const regex = /[^<>\/\":;$!'\;={}&]+$/;

// joi schemas
const testNumberSChema = joi.number().max(5);
const townSchema = joi.string().min(5).pattern(regex);
const messageSchema = joi.object({
    headline: joi.string().min(1).max(20).required().pattern(regex), 
    type: joi.string().valid("bug", "question", "other").required().pattern(regex), 
    email:joi.string().email().allow(null, "").pattern(regex), 
    message: joi.string().min(20).max(400).required().pattern(regex)
});

// middleware
const GETLimiterMW = rateLimit({
    windowMs: 10 * 60 * 1000, //multiplayer*(millseconds to minutes)
    max: 100,
    message: "You have made too many requests. Try again little later. Note this is server safety feature not user error! It is made to protect website from attacks."
});

const POSTLimiterMW = rateLimit({
    windowMs: 60 * 60 * 1000, //multiplayer*(millseconds to minutes)
    max: 10,
    message: "You have made too many submits. Try again little later. Note this is server safety feature not user error! It is made to protect website from attacks."
});

//dot env conf
dotenv.config();

// express node config stuff
const app = express();
// app uses
app.use(express.static("public"));
app.use(hpp());
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(helmet({
    contentSecurityPolicy:{
        directives:{
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "default-src": [
                "'self'",
                "https://platform.twitter.com/",
                "https://www.facebook.com/",
                "https://cdn.jsdelivr.net/",
                "https://freegeoip.app/json/",
                "https://web.facebook.com/",
                "https://pagead2.googlesyndication.com",
                "https://googleads.g.doubleclick.net",
                "https://adservice.google.com",
                "https://partner.googleadservices.com",
                "https://adservice.google.fi",
                "https://www.googletagservices.com",
                "https://tpc.googlesyndication.com/",
                "https://www.google.com"
        
            ],
            "img-src": [
                "'self'",
                 "https://catcastimgs.s3.eu-north-1.amazonaws.com",
                 "https://images.unsplash.com",
                 "https://syndication.twitter.com",
                 "https://pagead2.googlesyndication.com/",
                 "https://www.gstatic.com/"
            ],
            "script-src": [
                "'self'", 
                "https://platform.twitter.com/",
                "https://platform.linkedin.com/",
                "https://cdn.jsdelivr.net",
                "https://connect.facebook.net",
                "https://pagead2.googlesyndication.com",
                "https://googleads.g.doubleclick.net",
                "https://adservice.google.com",
                "https://partner.googleadservices.com",
                "https://adservice.google.fi",
                "https://www.googletagservices.com",
                "https://tpc.googlesyndication.com/",
                "https://www.google.com",
                "https://www.gstatic.com/"
            ]
        }
}}));
app.use(cookieParser());
app.use(csurf({cookie:true}));
app.use(cookieSession({
    name:"keksi",
    secret: process.env.COOKIE_SECRET,
    keys: new Keygrip(['key1', 'key2'], 'SHA384', 'base64'),
    cookie:{
        secure: true,
        httpOnly: true,
        domain: "dev.catsopinion.com",
        expires: new Date(Date.now() + 60 * 60 * 1000) 
    }

}));

// set
app.set("views", path.join(__dirname, "views"));
app.set("html", path.join(__dirname, "html"));
app.engine("html", ejs);
app.set("view engine", "html");

// mmongodb connection
const client = new MongoClient(process.env.MONGO_CONNECTION_URI, {useNewUrlParser:true, useUnifiedTopology:true});

// ******** routes ***********
app.get("/privacyPolicy", GETLimiterMW, (req, res) => {
    console.log("Privacy");
    res.sendFile("html/privacyPolicy.html",{root:__dirname});
});

app.get("/blog", GETLimiterMW, (req, res) => {
    console.log("blog")
    res.sendFile("html/blog.html",{root:__dirname});
});

app.get("/funzone", GETLimiterMW, (req, res) => {
    console.log("funzone")
    res.sendFile("html/funZone.html",{root:__dirname});
});

app.get("/blog/getPosts", GETLimiterMW, async (req, res) => {
    console.log("getposts");
    const amount = req.query.quantity;
    let newestPosts = [];
    let index = 0; 
    const{error, result} = testNumberSChema.validate(amount, {stripUnknown:true}); 
    if(!error && amount > 10){
        try {
            const client = new MongoClient(process.env.MONGO_CONNECTION_URI, {useNewUrlParser:true, useUnifiedTopology:true});
            await client.connect();
            const collection = client.db(process.env.DATABASE).collection(process.env.BLOGPOSTINGS_COLLECTION);
            collection.find().sort({year:-1, month:-1, day:-1}).forEach((data) => {
                if(index == amount || index > amount){
                    res.json(newestPosts);
                    client.close();
                }else{
                    newestPosts.push(data);
                    index++;
                }
            });
        } finally {
            await client.close();
        }
    }else if(!error){
        try{
            const client = new MongoClient(process.env.MONGO_CONNECTION_URI, {useNewUrlParser:true, useUnifiedTopology:true});
            await client.connect();
            const collection = client.db(process.env.DATABASE).collection(process.env.BLOGPOSTINGS_COLLECTION);
            collection.find({}).toArray((err, data) => {
                res.json(data);
                client.close();
            });
        } finally {
            await client.close();
        }
    }
    else{
        res.sendStatus(500);
    }
});

app.get("/blog/openpost", GETLimiterMW, async (req, res) => {
    console.log("open post")
    const id = ObjectID(req.query.id);
    if(ObjectID.isValid(id)){
        try {
            const client = new MongoClient(process.env.MONGO_CONNECTION_URI, {useNewUrlParser:true, useUnifiedTopology:true});
            await client.connect();
            const collection = client.db(process.env.DATABASE).collection(process.env.BLOGPOSTINGS_COLLECTION);
            collection.findOne({_id:id}, (err, document) => {
                if(err) throw err;
                res.json(document);
            });
        } finally {
            await client.close();
        }
    }
});

app.post("/contact", POSTLimiterMW, async (req, res) => {
    console.log("contact")
    const captchFromWeb = req.body["g-recaptcha-response"];
    const recaptcha_verification_url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_KEY}&response=${captchFromWeb}`;
    request.post(recaptcha_verification_url, async (err, response, body) =>{
        let responseObject = JSON.parse(response.body); 
        if(err){
            //console.log(err);
        }
        else if(responseObject.success){
            const {error, value} = messageSchema.validate({headline:req.body.headLine, type: req.body.type, email: req.body.email, message: req.body.message}, {stripUnknown:true});
            if(!error){
                try {
                    const client = new MongoClient(process.env.MONGO_CONNECTION_URI, {useNewUrlParser:true, useUnifiedTopology:true});
                    await client.connect();
                    const collection = client.db(process.env.DATABASE).collection(process.env.CONTACTS_COLLECTION);
                    const message = {"headline":req.body.headLine, "type": req.body.type, "email": req.body.email, "message": req.body.message};
                    collection.insertOne(message, (err, res) => {
                        if (err) throw err;
                    });
                } finally {
                    await client.close();
                }
                res.sendFile("html/formSuccesfull.html",{root:__dirname});

            }else{
                    res.sendStatus(422);
            }
        }else{
            console.log(responseObject.success);
            res.sendStatus(401)
        }
    });  
});

app.get("/contact", GETLimiterMW, (req, res) => {
    console.log("openContact")
    const token = req.csrfToken();
    res.render("contact.html", {csrfToken: token});
});

// make call to openweather api
app.get("/find", GETLimiterMW, async (req,response) => {
    console.log("find")
    const cityName = req.query.town ;
    const {error, value} = townSchema.validate(cityName, {stripUnknown:true});
    let dataModder = new DataModder();
    if(!error){
        const formattedName = dataModder.makePigGermanysaize(cityName);
        const apiAddres = `http://api.openweathermap.org/data/2.5/weather?q=${formattedName}&appid=${process.env.OPENWEATHER_APIKEY}&units=metric`;
        request(apiAddres, {json:true}, async (err, res, body) =>{
            if(err){
                response.sendStatus(500);
            }
            else if(body.cod == 404){
                response.json(body);
            }
            else{
                
                response.json(await getCatsAnalysis(dataModder.getrelevantData(res.body)))
            }
        });
    }else{
        response.sendStatus(204);
    }
});

// get home page
app.get("/", GETLimiterMW, async (req, res) => {
    console.log("home")
    res.cookie("user_lang", "EN",{secure:true, httpOnly:true, expires:new Date(Date.now() + 1 * 3600000)});
    res.sendFile("html/index.html", {root: __dirname});
});

const getCatsAnalysis = async (dataObject) =>{
    let cat = new Cat();
    const catsOpinion = cat.getWeatherOpinion(dataObject);
    try {
        const client = new MongoClient(process.env.MONGO_CONNECTION_URI, {useNewUrlParser:true, useUnifiedTopology:true});
        await client.connect();
        let collection = client.db(process.env.DATABASE).collection(process.env.INFO_COLLECTION);
        await collection.find({title: {$in:[catsOpinion.tempQuery, catsOpinion.humidityQuery, catsOpinion.windQuery]}}, {}).forEach((data) => {
           if(data.type == "temp"){
                catsOpinion["tempMessage"] = data.message;
           }else if(data.type == "wind"){
                catsOpinion["windMessage"] = data.message;
           }else if(data.type == "humidity"){
                catsOpinion["humidityMessage"] = data.message;
           }
        });
        let collection_selection;
        if(catsOpinion.catWantsOut){
            collection_selection = process.env.CATMESSAGES_GOOUT_COLLECTION;
        }
        else if(!catsOpinion.catWantsOut){
            collection_selection = process.env.CATMESSAGES_STAYIN_COLLECTION;
        }
        collection = client.db(process.env.DATABASE).collection(collection_selection);
        let dataModder = new DataModder();
        let queryResult = await collection.findOne({aNumber: dataModder.makeRandom()}, {});
        catsOpinion["catsVerdict"] = queryResult.message;
    } finally {
        await client.close();
    }
    return catsOpinion;
}

app.listen(process.env.PORT, () => {
    console.log(`Example app listening at http://localhost:${process.env.PORT}`)
});

