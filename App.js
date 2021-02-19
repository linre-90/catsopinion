// require
require ('newrelic');
const express = require("express");
const request = require("request");
const dotenv = require("dotenv");
const { ObjectID } = require("bson");
const ejs = require("ejs");
const Keygrip = require("keygrip");
const path = require("path");
const rateLimit = require("express-rate-limit");
const {logger, reqLogger} = require("./Logger");
const { Pool, Client } = require('pg');
const {getNewestPostsCards, getSinglePost, getCatsOpinionDatabase, insertMessage} = require("./queryStore"); 
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
const { title } = require('process');
const regex = /[^<>\/\\":;\$!'\;=\{\}&\*]+$/;

// joi schemas
const number = joi.number();
const townSchema = joi.string().min(2).pattern(regex);
const messageSchema = joi.object({
    headline: joi.string().min(1).max(20).pattern(regex), 
    type: joi.string().valid("bug", "question", "other"), 
    email:joi.string().email().pattern(regex).allow(null, ""), 
    message: joi.string().min(20).max(400).pattern(regex)
});

//sql 
const pool = new Pool({connectionString:process.env.DATABASE_URL, ssl:{rejectUnauthorized:false}});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
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


// ******** routes ***********
app.get("/privacyPolicy", GETLimiterMW, (req, res) => {
    res.render("pages/privacyPolicy.ejs", {
        meta:privacyPolicyMeta, 
        scriptArray: privacyPolicy, 
        homePage:false, 
        contactPAge:false, 
        blogPage:false, 
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
    getNewestPostsCards(pool).then((data) => {
        res.render("pages/blog.ejs", {
            meta:blogMeta, 
            scriptArray: blog, 
            homePage:false, 
            contactPAge:false, 
            blogPage:true, 
            funzonePage:false, 
            posts:data, 
            style:blogCss
        });
    }).catch(console.dir);
});

// Api route
app.get("/blog/openpost", GETLimiterMW, async (req, res) => {
    const {error, value} = number.validate(req.query.id, {stripUnknown:true});
    if(!error){
        getSinglePost(pool, req.query.id).then((data) => {
            res.json(data);
        });
    }else{
        res.sendStatus(500);
    }
});

app.post("/contact", POSTLimiterMW, async (req, res) => {

    const captchFromWeb = req.body["g-recaptcha-response"];
    const recaptcha_verification_url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_KEY}&response=${captchFromWeb}`;
    request.post(recaptcha_verification_url, async (err, response, body) =>{
        let responseObject = JSON.parse(response.body); 
        if(err){res.sendStatus(403)}
        else if(responseObject.success){
            const {error, value} = messageSchema.validate({headline:req.body.headLine, type: req.body.type, email: req.body.email, message: req.body.message}, {stripUnknown:true});
            if(!error){
                console.log("sending to db")
                let status = await insertMessage(pool, req.body.headLine, req.body.type, req.body.email,req.body.message);
                console.log(status.rowCount);
                res.render("pages/formSuccesfull.ejs", {
                    meta:formSuccesfullMeta, 
                    scriptArray: formSuccesfull, 
                    style:formsuccesCss
                });
            }else{
                console.log("bad input")
                res.sendStatus(403);
            }
        }else{
            console.log("bad captcha")
            res.sendStatus(403);
        }
    });  
});

app.get("/contact", GETLimiterMW, async (req, res) => {
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
            //console.log("apiCall")
            const formattedName = dataModder.makePigGermanysaize(cityName);
            const apiAddres = `http://api.openweathermap.org/data/2.5/weather?q=${formattedName}&appid=${process.env.OPENWEATHER_APIKEY}&units=metric`;
            const answer=request(apiAddres, {json:true}, async (err, res, body) =>{
            if(err){
                next()
            }else if(body.cod != 200){
                response.sendStatus(400);
            }
            else{
                response.json(await getCatsAnalysis(dataModder.getrelevantData(res.body)));
            }
        }).body;
        } catch (error) {
            next(error)
        }
    }else if(error){
        //console.log("bad string");
        response.sendStatus(400);
    }
});

// get home page
app.get("/", GETLimiterMW, async (req, res) => {
    res.render("pages/home.ejs", {
        meta:homeMeta, 
        scriptArray: home, 
        homePage:true, 
        contactPAge:false, 
        blogPage:false, 
        funzonePage:false, 
        style:homeCss});
});

app.get("/openapp", GETLimiterMW, async (req, res) => {
    const appName = req.query.app ;
    const {error, value} = townSchema.validate(appName, {stripUnknown:true});
    if(!error){
        res.render("pages/appBackground.ejs", {app: appName});
    }else{
        res.sendStatus(400);
    }  
});

const getCatsAnalysis = async (dataObject) =>{
    let cat = new Cat();
    let catsOpinion = cat.getWeatherOpinion(dataObject);
    let catMessageQuey = "";
    if(catsOpinion.catWantsOut){
        catMessageQuey = "go_out";
    }
    else{
        catMessageQuey = "stay_in";
    }
    let objects = await getCatsOpinionDatabase(pool, catsOpinion.tempQuery, catsOpinion.humidityQuery, catsOpinion.windQuery, catMessageQuey);
    objects.forEach(obj => {
        if(obj.info_type == "cats_verdict"){
            catsOpinion["catsVerdict"] = obj.catmessage;
        }
        else if(obj.info_type == "temp"){
            catsOpinion["tempMessage"] = obj.message;
        }
        else if(obj.info_type == "wind"){
            catsOpinion["windMessage"] = obj.message;
        }
        else if(obj.info_type == "humidity"){
            catsOpinion["humidityMessage"] = obj.message;
        }
    });
    return catsOpinion;
}

app.listen(process.env.PORT, () => {
    console.log(`Server started and running`)
});

