const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator')
const mypath = '';
const User = require('../models/user.js');

const transporter = nodemailer.createTransport(sendgridTransport({
	auth:{
		api_key: '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'
	}
}));


exports.getLoginPage =(req, res, next)=>{

		let message = req.flash('error');
		if(message.length > 0){
			message = message[0];
		}else{
			message = null;
		}

		res.render('auth/login', {
			docType: 'Login', 
			mypath: '/login',
			errorMessage: message,
			oldInput:{
				email:'',
				password:''
			},

		validationErrors: []
			
	});

} 



exports.login =(req, res, next)=>{
		const email = req.body.email;
		const password = req.body.password;
		const errors = validationResult(req);

		if(!errors.isEmpty()){
			// console.log(errors.array());
			return res.status(422).render('auth/login', {
		docType: 'login',
		 mypath: '/login',
		 errorMessage: errors.array()[0].msg,
		 oldInput:{
		 		email: email,
		 		password: password,
		 	},
		 validationErrors: errors.array()
		});

		}

 User.findOne({email: email})
    .then(user => {

    	console.log(user);

    	if(!user){
    			return res.status(422).render('auth/login', {
				docType: 'login',
		 		mypath: '/login',
		 		errorMessage: 'Invalid email or password',
		 		oldInput:{
		 			email: email,
		 			password: password,
		 		},
		 	validationErrors: []
			});
    	}

    	bcrypt.compare(password, user.password)
    	.then(doMatch=>{
    		if (doMatch) {
    			 req.session.isLoggedIn = true;
      		 req.session.user = user;
      		 return req.session.save(err=>{
      		 			console.log(err);
      		 			res.redirect('/');
      		 });
    			}
    		  return res.status(422).render('auth/login', {
				docType: 'login',
		 		mypath: '/login',
		 		errorMessage: 'Invalid email or password',
		 		oldInput:{
		 			email: email,
		 			password: password,
		 		},
		 	validationErrors: []
			});

    	})
    	.catch(error=>{
    		console.log(error);
    		res.redirect('/login');
    	});


    })
    .catch(err => console.log(err));
}


exports.postLogout = (req, res, next)=>{
	req.session.destroy((err)=>{
		console.log(err)
		res.redirect('/');
	});
}





exports.getSignupPage =(req, res, next)=>{


		let message = req.flash('error');
		if(message.length > 0){
			message = message[0];
		}else{
			message = null;
		}

		res.render('auth/signup', {
		docType: 'Sign-Up',
		 mypath: '/sign-up',
		 errorMessage: message,
		 		oldInput:{
		 		name: '',
		 		email: '',
		 		password: '',
		 		confirmPassword: ''

		 	},
		 	validationErrors: []

		});

} 


exports.postSignup = (req, res, next)=>{
		const name = req.body.name;
		const email = req.body.email;
		const password = req.body.password;
		const confirmPassword = req.body.confirm_password;

		const errors = validationResult(req);
		console.log(errors);
		if(!errors.isEmpty()){
			return res.status(422).render('auth/signup', {
		docType: 'Sign-Up',
		 mypath: '/sign-up',
		 errorMessage: errors.array()[0].msg,
		 oldInput:{
		 		name: name,
		 		email: email,
		 		password: password,
		 		confirmPassword: confirmPassword

		 	},
		 validationErrors: errors.array()
		});

		}


	
			bcrypt.hash(password, 12).then(hashPassword=>{
						const user = new User({
							name: name,
							email: email,
							password: hashPassword,
							cart: { items: [] }
						});
					return user.save(); 
				}).then(result=>{

					res.redirect('/login');

					return transporter.sendMail({
						to: email,
						from: 'imransaeed@solutionsurface.com',
						subject: 'Signup Success',
						text: `Hello ${name}`
						// html: "<h1>Sign-Up Done</h1>"
					});

			}).catch(err=>{
				console.log(err);
			});


}


exports.getResetPage =(req, res, next)=>{
		let message = req.flash('error');
		if(message.length > 0){
			message = message[0];
		}else{
			message = null;
		}

		res.render('auth/reset', {
			docType: 'Reset-Password', 
			mypath: '/Reset-Password',
			errorMessage: message
			// isAuthenticated: false,
			// csrfToken: req.csrfToken()
	});

}; 



exports.postReset = (req, res, next)=>{

	crypto.randomBytes(32, (err, buffer)=>{

		if (err) {
			console.log(err);
			return res.redirect('/reset-password');
		}

		const token = buffer.toString('hex');
		User.findOne({email: req.body.email})
		.then(user=>{
				if (!user) {
					req.flash('error', 'No Account is found for that email...');
					return res.redirect('/reset-password');
				}
				user.resetToken = token;
				user.resetTokenExpiry = Date.now() + 3600000;
				return user.save();
		}).then(result=>{

				res.redirect('/');

				transporter.sendMail({
						to: req.body.email,
						from: 'imransaeed@solutionsurface.com',
						subject: 'Reset Password',
						html: `<p>You have requested for password reset..</p><br>
								<p>Click This <a href="http://localhost:4000/reset-password/${token}">To set new password</a></p>
								`
					});

		})
		.catch(err=>{
			console.log(err)
		});

	});


};


exports.getUpdatePassword = (req, res, next)=>{

		const token = req.params.token;

		console.log(token);
		User.findOne({resetToken: token, resetTokenExpiry: {$gt: Date.now()}}).then(user=>{

			let message = req.flash('error');
			if(message.length > 0){
				message = message[0];
			}else{
				message = null;
			}

			res.render('auth/new_password', {
				docType: 'New-Password', 
				mypath: '/New-Password',
				errorMessage: message,
				userId: user._id.toString(),
				passwordToken: token
			});


		}).catch(err=>{
				console.log(err)
		});


};




exports.postUpdatePassword = (req, res, next)=>{

		const token = req.body.passwordToken;
		const userId = req.body.user_id;
		const newPassword = req.body.new_password;

		let resetUser;

		User.findOne({resetToken: token, resetTokenExpiry:{$gt: Date.now()}, _id: userId })
		.then(user=>{
			resetUser = user;
			return bcrypt.hash(newPassword, 12);
		}).then(hashPassword=>{
			resetUser.password = hashPassword;
			resetUser.resetToken = null;
			resetUser.resetTokenExpiry = null;
			return resetUser.save();

		}).then(result=>{
			res.redirect('/login');
		})
		.catch(err=>{
			console.log(err)
		})




};