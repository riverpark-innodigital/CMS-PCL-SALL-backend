const express = require('express');
const cors = require('cors');
const { readdirSync } = require('fs');
const passport = require('passport');
const morgen = require('morgan');
const { sawgerserver, swaggerui } = require('./config/swagger');
// const { app_sawgerserver, app_swaggerui } = require('./config/swagger-app');
const initailDatas = require('./initials/main');
const createFolder = require('./initials/initial_folder');
const rateLimitConfig = require('./config/rateLimitConf');

// require('newrelic');
require('dotenv').config();
require('./middlewares/authMiddleware');

const app = express();
const port = process.env.PORT || 4000;

const corsOptions = {
    origin: '*', // Allow requests only from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow only specific HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization', 'Authorization', 'Origin', 'X-Requested-With', 'X-API-KEY'], // Allow specific headers
    credentials: true, // Allow cookies to be sent
  };
 
app.use(cors(corsOptions));
app.use(morgen('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(rateLimitConfig);

// apply heder for cross-origin requests test
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, X-API-KEY');
    next();
});

// this route below is a of api document
app.use('/docs', sawgerserver, swaggerui);
// app.use('/app/docs', app_sawgerserver, app_swaggerui);
app.use("/images", express.static('./uploads/Images'));
app.use("/files", express.static('./uploads/Files'));
app.use("/videos", express.static('./uploads/Videos'));

app.use('/api/authenticate', require('./routers/authenticate'));

app.use('/api/roles', require('./routers/system')); //ต้องกำหนด role ก่อนการสร้าง user s
app.use('/api/system', require('./routers/users')); // จะต้องมี token จากการ login ก่อน
app.use('/api/productsale', passport.authenticate('jwt', { session: false }), require('./routers/productsale'));
app.use('/api/productsale', passport.authenticate('jwt', { session: false }), require('./routers/productGroup'));
app.use('/api/productsale', passport.authenticate('jwt', { session: false }), require('./routers/productModel'));
app.use('/api/productManage', passport.authenticate('jwt', { session: false }), require('./routers/productManage'));
app.use('/api/productModel', passport.authenticate('jwt', { session: false }), require('./routers/productModel'));
app.use('/api/productGroup', passport.authenticate('jwt', { session: false }), require('./routers/productGroup'));
app.use('/api/supplierManage', passport.authenticate('jwt', { session: false }), require('./routers/supplier'));
app.use('/api/favoriteManage', passport.authenticate('jwt', { session: false }), require('./routers/favorite'));
app.use('/api/companyManage', passport.authenticate('jwt', { session: false }), require('./routers/company'));
app.use('/api/appFetch', passport.authenticate('jwt', { session: false }), require('./routers/app'));
app.use('/api/Dashboard', passport.authenticate('jwt', { session: false }), require('./routers/dashboard'));
app.use('/api/permission', passport.authenticate('jwt', { session: false }), require('./routers/permission'));
app.use('/api/notemanagement', passport.authenticate('jwt', { session: false }), require('./routers/note'));
app.use('/api/usermanagement', passport.authenticate('jwt', { session: false }), require('./routers/usermanagement'));
app.use('/api/bumanagement', passport.authenticate('jwt', { session: false }), require('./routers/bu'));
app.use('/api/presentation', passport.authenticate('jwt', { session: false }), require('./routers/presentation'));

// application route
app.use('/api/app/product-group', passport.authenticate('jwt', { session: false }), require('./app/router/pgroup'));
app.use('/api/app/suppliermanagement', passport.authenticate('jwt', { session: false }), require('./app/router/supplier'));
app.use('/api/app/productmanagement', passport.authenticate('jwt', { session: false }), require('./app/router/product'));
app.use('/api/app/presentation', passport.authenticate('jwt', { session: false }), require('./app/router/presentation'));

// import router files from the routers directory and apply them to the api endpoi
readdirSync('./routers').map((r) => app.use('/api', passport.authenticate('jwt', {session: false}), require(`./routers/` + r)));

app.get('/', async (req, res) => {
    try {
        res.status(200).json({
            message: "Server is running successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server running into an error",
            error: error,
        })
    }
});

app.listen(port, () => {
    try {
        initailDatas();
        createFolder();
        console.log(`🚀 Server is running on port ${port}`);
    } catch (error) {
        return console.error(error);
    }
})