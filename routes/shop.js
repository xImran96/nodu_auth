const express = require('express');


const router = express.Router();

const shopsController = require('../controller/shop.js')

const isAuth = require('../modules/auth.js');


 
router.get('/', shopsController.getIndex);

router.get('/products', shopsController.getProducts);

router.get('/products/:id', shopsController.getProduct);


router.get('/cart', isAuth, shopsController.getCart);

router.post('/cart', isAuth, shopsController.addCart);

router.post('/cart-product-remove', isAuth, shopsController.postCartRemove);

// router.get('/checkout', shopsController.getCheckout);

router.get('/orders', isAuth, shopsController.getOrders);


router.post('/create-order', isAuth, shopsController.addOrder);


router.get('/orders/:id', isAuth, shopsController.getInvoice);


module.exports = router;