// core modules
const http = require('http');
const path = require('path');

// 3rd party modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
// my modules
const adminRoutes = require('./routes/admin.js');
const shopRoutes = require('./routes/shop.js');
const authRoutes = require('./routes/auth.js');
const errorsController = require('./controller/errors.js');
const User = require('./models/user.js');
const multer = require('multer');

const MONGODB_URI = 'mongodb+srv://x_imran96:KPiakg82dHlXDEmP@cluster0.2asma.mongodb.net/shop?retryWrites=true&w=majority';

const app = express();
const store = new MongoDbStore({
	uri: MONGODB_URI,
	collection: 'sessions'
});

// ini the storing engine

const fileStorage = multer.diskStorage({
	destination: (req, file, cb)=>{
		cb(null, 'images');
	},
	filename: (req, file, cb)=>{
		 // cb(null, file.filename + '-' + file.originalname);
		 cb(null, Date.now() +'-'+file.originalname);
	}
});



const fileFilter =  (req, file, cb)=>{
	  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
	  	cb(null, true);

	  }else{
	  	cb(null, false);
	  }
}


const csrfProtection = csrf();

// temp engine
app.set('view engine', 'ejs');
app.set('views', 'views');


// files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// body perser only buffer and transfar text form of data for files we have to use another 3rd party pakage "multer"
app.use(bodyParser.urlencoded({extended: false}));


app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

// app.use(multer({dest: 'images'}).single('image'));
// session initialize on middleware

app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store: store})); //write cookie is automatically install cookie here and also parce it and this middle ware is alone setup it 
// app.use(session({secret: 'My Secret', resave: false, saveUninitialized: false, cookie:{maxAge: 10}})); 

app.use(flash());



// this will add a another middleware which will do parsing for for us  which we did manually uptil now/ req.user = user;

app.use(csrfProtection);


app.use((req, res, next)=>{
	if(!req.session.user){
		return next();
	}
	User.findById(req.session.user._id).then(user=>{

		if(!user){
			return next();
		}
		req.user = user;
		// console.log(req.user);
		next();
	}).catch(err=>{
		// throw new Error(err)
		next(new Error(err));
		// console.log(err);
	});
});

app.use((req, res, next)=>{
	res.locals.isAuthenticated = req.session.isLoggedIn;
	res.locals.csrfToken = req.csrfToken();
	next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorsController.get500)
app.use(errorsController.get404);

app.use((error, req, res, next)=>{
	console.log(error);
	res.redirect('/500');
});



mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true, useFindAndModify:false})
.then(result=>{


	User.findOne().then(user=>{

		if(!user){
			
			const user = new User({

			name: "Muhammad Imran",
			email: "x.imran96@gmail.com",
			cart: {
				items: []
				} 

			});

			user.save()

		}

	});


	app.listen(4000, ()=>{
		console.log("connected to server...");
	});
})
.catch(err=>{
	console.log(err)
});


//to add external 
// files need to be access statically by statically we means that it not handled by express router but instead directly handled by File system