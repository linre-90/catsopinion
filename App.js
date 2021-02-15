// require
require ('newrelic');
const express = require("express");
const request = require("request");
const dotenv = require("dotenv");
const MongoClient = require("mongodb").MongoClient;
const { ObjectID } = require("bson");
const ejs = require("ejs");
const Keygrip = require("keygrip");
const path = require("path");
const rateLimit = require("express-rate-limit");
const {logger, reqLogger} = require("./Logger");
// non server stuff
let Cat = require("./Cat");
let DataModder = require("./DataModder");
// data stores
const {homeMeta, blogMeta, contactMeta, formSuccesfullMeta, funZoneMeta, privacyPolicyMeta} = require("./MetaStore");
const {home, blog, contact, formSuccesfull, funZone, privacyPolicy} = require("./ScriptStore");
const {homeCss, blogCss, contactCss, funzoneCss, privacyCss, formsuccesCss}= require("./CssStore");

//dot env conf
dotenv.config();

// express node config stuff
const app = express();

// security
const helmet = require("helmet");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const csurf = require("csurf");
const cookieSession = require("cookie-session");
const joi = require("joi");
const regex = /[^<>\/\":;$!'\;={}&]+$/;

// joi schemas
const townSchema = joi.string().min(2).pattern(regex);
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
                "https://www.google.com",
                "https://cdnjs.cloudflare.com"
        
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
                "https://www.gstatic.com/",
                "https://cdnjs.cloudflare.com"
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
app.use((req, res, next) =>{
    if(req.method == "GET"){
        reqLogger.info({"method":req.method, "status": res.statusCode ,"ip":req.ip, "URL": req.url});
    }
    else if(req.method == "POST"){
        reqLogger.info({"method":req.method, "status": res.statusCode ,"ip":req.ip, "URL": req.url});
    }
    next();
});
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
  })
// set
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// mmongodb connection
const client = new MongoClient(process.env.MONGO_CONNECTION_URI, {useNewUrlParser:true, useUnifiedTopology:true});

// ******** routes ***********
app.get("/privacyPolicy", GETLimiterMW, (req, res) => {
    res.render("pages/privacyPolicy.ejs", {
        meta:privacyPolicyMeta, 
        scriptArray: privacyPolicy, 
        homePage:false, 
        contactPAge:false, 
        blogPage:true, 
        funzonePage:false, 
        style:privacyCss
    });
});

app.get("/funzone", GETLimiterMW, (req, res) => {
    res.render("pages/funZone.ejs", {
        meta:funZoneMeta, 
        scriptArray: funZone, 
        homePage:false, 
        contactPAge:false, 
        blogPage:false, 
        funzonePage:true, 
        style:funzoneCss
    });
});

app.get("/blog", GETLimiterMW, async (req, res) => {
    try {
        const client = new MongoClient(process.env.MONGO_CONNECTION_URI, {useNewUrlParser:true, useUnifiedTopology:true});
        await client.connect();
        const collection = client.db(process.env.DATABASE).collection(process.env.BLOGPOSTINGS_COLLECTION);
        collection.find({}).sort({year:-1, month:-1, day:-1}).toArray((err,data) => {
            let newestFive = data.slice(0, 5)
            res.render("pages/blog.ejs", {
                meta:blogMeta, 
                scriptArray: blog, 
                homePage:false, 
                contactPAge:false, 
                blogPage:true, 
                funzonePage:false, 
                posts:newestFive, 
                style:blogCss
            });
        });
    } finally {
        await client.close();
    }
});

// Api route
app.get("/blog/openpost", GETLimiterMW, async (req, res) => {
    const id = ObjectID(req.query.id);
    if(ObjectID.isValid(id)){
        try {
            const client = new MongoClient(process.env.MONGO_CONNECTION_URI, {useNewUrlParser:true, useUnifiedTopology:true});
            await client.connect();
            const collection = client.db(process.env.DATABASE).collection(process.env.BLOGPOSTINGS_COLLECTION);
            collection.findOne({_id:id}, (err, document) => {
                if(err) next(err);
                res.json(document);
            });
        } finally {
            await client.close();
        }
    }
});

app.post("/contact", POSTLimiterMW, async (req, res) => {
    const captchFromWeb = req.body["g-recaptcha-response"];
    const recaptcha_verification_url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_KEY}&response=${captchFromWeb}`;
    request.post(recaptcha_verification_url, async (err, response, body) =>{
        let responseObject = JSON.parse(response.body); 
        if(err){next(err)}
        else if(responseObject.success){
            const {error, value} = messageSchema.validate({headline:req.body.headLine, type: req.body.type, email: req.body.email, message: req.body.message}, {stripUnknown:true});
            if(!error){
                try {
                    const client = new MongoClient(process.env.MONGO_CONNECTION_URI, {useNewUrlParser:true, useUnifiedTopology:true});
                    await client.connect();
                    const collection = client.db(process.env.DATABASE).collection(process.env.CONTACTS_COLLECTION);
                    const message = {"headline":req.body.headLine, "type": req.body.type, "email": req.body.email, "message": req.body.message};
                    collection.insertOne(message, (err, res) => { if (err) throw err;});
                } finally {
                    await client.close();
                }
                res.render("pages/formSuccesfull.ejs", {
                    meta:formSuccesfullMeta, 
                    scriptArray: formSuccesfull, 
                    style:formsuccesCss
                });
            }
        }
    });  
});

app.get("/contact", GETLimiterMW, (req, res) => {
    res.render("pages/contact.ejs", {
        meta:contactMeta, 
        scriptArray: contact, 
        homePage:false, 
        contactPAge:true, 
        blogPage:false, 
        funzonePage:false, 
        style:contactCss,
        csrfToken: req.csrfToken()});
});

// Api route
app.get("/find", GETLimiterMW, async (req,response) => {
    const cityName = req.query.town ;
    const {error, value} = townSchema.validate(cityName, {stripUnknown:true});
    let dataModder = new DataModder();
    if(!error){
        try {
            const formattedName = dataModder.makePigGermanysaize(cityName);
            const apiAddres = `http://api.openweathermap.org/data/2.5/weather?q=${formattedName}&appid=${process.env.OPENWEATHER_APIKEY}&units=metric`;
            const answer=request(apiAddres, {json:true}, async (err, res, body) =>{
            if(err){
                next()
            }else if(body.cod != 200){
                response.sendStatus(400);
            }
            else{
                response.json(await getCatsAnalysis(dataModder.getrelevantData(res.body)))
            }
        }).body;
        } catch (error) {
            next(error)
        }
    }else if(error){
        response.sendStatus(400);
    }
});

// get home page
app.get("/", GETLimiterMW, async (req, res) => {
    res.cookie("user_lang", "EN",{secure:true, httpOnly:true, expires:new Date(Date.now() + 1 * 3600000)});
    res.render("pages/home.ejs", {
        meta:homeMeta, 
        scriptArray: home, 
        homePage:true, 
        contactPAge:false, 
        blogPage:false, 
        funzonePage:false, 
        style:homeCss});
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
    console.log(`Server started and running`)
});

