const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const mypath = '';
const Cart = require('../models/cart.js');
const Product = require('../models/product.js');
const Order = require('../models/order.js');


const ITEMS_PER_PAGE = 2;



exports.getProducts = (req, res, next)=>{
	
	const pageNo = +req.query.page || 1;

	let totalItems;
	Product.find().countDocuments().then(theProducts=>{
		totalItems = theProducts;
		return Product.find()
			.skip((pageNo-1) * ITEMS_PER_PAGE)
			.limit(ITEMS_PER_PAGE)
			.populate('userId');

	}).then((products)=>{
		// console.log(products);
	res.render('shop/product-list', {
		prods: products,
		docType: 'Products',
		mypath: '/products',
		totalProducts: totalItems,
		currentPage: pageNo,
		hasNextPage: ITEMS_PER_PAGE * pageNo < totalItems,
		hasPreviousPage: pageNo > 1,
		nextPage: pageNo + 1,
		previousPage: pageNo - 1,
		lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
	});
	
	}).catch(err=>{
		const error = new Error(err);
		err.httpStatusCode = 500;
		return next(error); 	
	});
}

exports.getProduct = (req, res, next)=>{
	
	const prodId = req.params.id;
	Product.findById(prodId).then((product)=>{
		// console.log(product);
	res.render('shop/product', {
		product: product,
		docType: product.title,
		mypath: '/products',

		});
	}).catch(err=>{


		const error = new Error(err);
		err.httpStatusCode = 500;
		return next(error); 


	});

		
}


exports.getIndex = (req, res, next)=>{
	const pageNo = +req.query.page || 1;
	let totalItems;
	Product.find().countDocuments().then(theProducts=>{
		totalItems = theProducts;
		return Product.find()
			.skip((pageNo-1) * ITEMS_PER_PAGE)
			.limit(ITEMS_PER_PAGE)
			.populate('userId');

	}).then((products)=>{
		// console.log(products)
		res.render('shop/index', {
			prods: products,
			docType: 'Shop',
			 mypath: '/',
			 totalProducts: totalItems,
			currentPage: pageNo,
			hasNextPage: ITEMS_PER_PAGE * pageNo < totalItems,
			hasPreviousPage: pageNo > 1,
			nextPage: pageNo + 1,
			previousPage: pageNo - 1,
			lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
	
			});
	}).catch(err=>{
		
		const error = new Error(err);
		err.httpStatusCode = 500;
		return next(error); 

	});

}


exports.getCart = (req, res, next)=>{


	req.user
	.populate('cart.items.productId')
	.execPopulate()
	.then(user=>{
		res.render('shop/cart', {
			cartItems: user.cart.items,
			docType: 'Cart',
			mypath: '/cart',
		});
	}).catch((err)=>{

		const error = new Error(err);
		err.httpStatusCode = 500;
		return next(error); 

	});
}

exports.addCart = (req, res, next)=>{
	
	const prodId = req.body.product_id;
	Product.findById(prodId).then(product=>{
		return req.user.addToCart(product);
	}).then(result=>{
		return res.redirect('/cart');
	}).catch(err=>{

		const error = new Error(err);
		err.httpStatusCode = 500;
		return next(error); 

	});
}


exports.getOrders = (req, res, next)=>{

	Order.find({'user.userId': req.user._id}).populate('products.product').then(orders=>{
			// console.log(orders[0]);
	res.render('shop/order', {
		orders: orders, 
		mypath:'/orders', 
		docType: 'Orders', 
		});		
	}).catch(err=>{

		const error = new Error(err);
		err.httpStatusCode = 500;
		return next(error); 

	});
}



exports.addOrder = (req, res, next)=>{


	req.user
	.populate('cart.items.productId')
	.execPopulate()
	.then(user=>{
		const allProducts = user.cart.items.map(i=>{
			// return {quantity: i.quantity, product: i.productId}
			return {quantity: i.quantity, product: {...i.productId._doc}}

		}); 

		// console.log(allProducts);

		const order = new Order({
			user:{
				email: req.user.email,
				userId: req.user
			},
			products: allProducts
		});
		return order.save();
	}).then(result=>{
		return req.user.clearCart();
		
	}).then(()=>{
		res.redirect('/')
	}).catch(err=>{

		const error = new Error(err);
		err.httpStatusCode = 500;
		return next(error); 


	});
	
}

exports.getCheckout = (req, res, next)=>{
	res.render('shop/checkout', {
		mypath:'/checkout',
		docType: 'Checkout', 
		isAuthenticated: req.session.isLoggedIn
	});
}



exports.postCartRemove = (req, res, next)=>{
	req.user.deleteCartItem(req.body.product_id)
	.then(result=>{
		res.redirect('/cart');
	}).catch(err=>{

		const error = new Error(err);
		err.httpStatusCode = 500;
		return next(error); 


	});

};



exports.getInvoice = (req, res, next)=>{


		const orderId = req.params.id;

		Order.findById(orderId).populate('products.product').then(order=>{
			if(!order){
				return next(new Error('Order not exist.'));
			}
			if(order.user.userId.toString() !== req.user._id.toString()){
				return next(new Error('Error detect'));
			}

			const invoice_id = 'invoice-'+orderId+'.pdf';
			const invoice_path = path.join('data', 'invoices', invoice_id);
			const pdfDoc = new PDFDocument();
			res.setHeader('Content-Type', 'application/pdf');
			 res.setHeader('content-disposition', 'inline; filename="'+ invoice_id +'"');
			
			pdfDoc.pipe(fs.createWriteStream(invoice_path));
			pdfDoc.pipe(res);
			// pdfDoc.text('Hello Imran');
			pdfDoc.fontSize(16).text('This is invoice', {
				underline: false
			})
			pdfDoc.text('----------------------------------------------------------');

			let totalPrice = 0;

			order.products.forEach(prod=>{

				totalPrice = totalPrice + (prod.quantity * prod.product.price);

				pdfDoc.text(prod.product.title + ' - ' + prod.quantity +' x '+ ' $ ' + prod.product.price);
			})
			pdfDoc.text('----------------------------------------------------------');
			pdfDoc.fontSize(24).text('Total Amount: $'+ totalPrice);

			pdfDoc.end()
		//  	
		//  fs.readFile(invoice_path, (err, data)=>{
		//  	if(err){
		//  	return next(err);
		//  	}
		//  	res.setHeader('Content-Type', 'application/pdf');
		//  	res.setHeader('content-disposition', 'inline; filename="'+ invoice_id +'"');
		//  	res.send(data);
		 
		//  });  


		 	// 	const file = fs.createReadStream(invoice_path);
		 	// 	res.setHeader('Content-Type', 'application/pdf');
			 // res.setHeader('content-disposition', 'inline; filename="'+ invoice_id +'"');
				// file.pipe(res);	

		}).catch(err=>{
			next(err);
		});


		// const invoice_id = 'invoice-'+orderId+'.pdf';
		// const invoice_path = path.join('data', 'invoices', invoice_id);
		//  fs.readFile(invoice_path, (err, data)=>{
		//  	if(err){
		//  	return next(err);
		//  	}
		//  	res.setHeader('Content-Type', 'application/pdf');
		//  	res.setHeader('content-disposition', 'inline; filename="'+ invoice_id +'"');
		//  	res.send(data);
		 
		//  });  

};