const express = require('express');

const router = express.Router();
const authController = require('../controller/auth.js');
const { body } = require('express-validator')

const User = require('../models/user.js');

router.get('/login', authController.getLoginPage);

router.post('/login', [
						body('email').isEmail().withMessage('Please enter valid email')
						.normalizeEmail(),
						body('password', 'Password has to valid')
						.isLength({ min: 5 })
						.trim(),

			], authController.login);

router.post('/logout', authController.postLogout);

router.get('/sign-up', authController.getSignupPage);

router.post('/sign-up', 
	[
	body('email').isEmail().withMessage('Please enter a valid email')
	.custom((value, {req})=>{
		// if(value === 'test@test.com'){
		// 	throw new Error('This E-mail is forbidden to use...');
		// }
		// return true;
		return User.findOne({ email: value }).then(userCheck=>{
			if(userCheck) {
				return Promise.reject('This email already exist. Please try with diffirent one');
			}
		});

		
	})
	.normalizeEmail(),
	
	 body('password', 'Please enter password with only number and text and atleast 5 characters')
	.isLength({ min: 5 })
	.trim(),

	 body('confirm_password', 'Please enter password with only number and text and atleast 5 characters')
	.isLength({ min: 5 })
	.custom((value, {req})=>{ 
		if (value !== req.body.password) {
			throw new Error('Password have to be matched.');
		}
		return true;
		}),
	
	],
	authController.postSignup);


router.get('/reset-password', authController.getResetPage);

router.post('/reset-password', authController.postReset);

router.get('/reset-password/:token', authController.getUpdatePassword);

router.post('/new-password', authController.postUpdatePassword);

module.exports = router;