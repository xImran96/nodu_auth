const express = require('express');

const router = express.Router();

const adminsController = require('../controller/admin.js')

const isAuth = require('../modules/auth.js');

const { body } = require('express-validator')


router.get('/add-product', isAuth, adminsController.getAddProduct);

router.post('/add-product',[
				body('title').isString().isLength({ min: 3 }).trim(),
				body('price').isFloat(),
				body('description').isLength({ min: 10, max: 400 }).trim()
	], isAuth, adminsController.postAddProduct);

router.get('/products', isAuth, adminsController.getProducts);



router.get('/edit-product/:id', isAuth, adminsController.getEditProduct);

router.post('/edit-product', [
				body('title').isString().isLength({ min: 3 }).trim(),
				body('price').isFloat(),
				body('description').isLength({ min: 10, max: 400 }).trim()
	], isAuth, adminsController.postEditProduct);

router.post('/delete-product', isAuth, adminsController.postDeleteProduct);


module.exports = router;        
