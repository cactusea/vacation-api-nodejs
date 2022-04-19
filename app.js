const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const mainRouter = require('./routes/main');
const vacationRouter = require('./routes/vacation');
const {sequelize} = require('./models');

const app = express();
sequelize.sync();

app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.set('port', process.env.PORT || 8001);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser('vacation'));
app.use(session({
    resave:false,
    saveUninitialized:false,
    secret:'vacation',
    cookie:{
        httpOnly:true,
        secure:false,
        maxAge: 1000 * 60 * 60 //1시간
    }
}));

app.use('/', mainRouter);
app.use('/vacation', vacationRouter);

app.use((req, res, next)=>{
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});


app.listen(app.get('port'), ()=>{
    console.log(app.get('port'),'번 포트에서 대기 중');
})

