const mypath = '';
const Product = require('../models/product.js');
const { validationResult } = require('express-validator')
const mongoose = require('mongoose');

const fileHelper = require('../modules/file.js');
const add = require('../modules/add.js');


exports.getAddProduct = (req, res, next)=>{

	if (!req.session.isLoggedIn) {
		res.redirect('/login');
	}


	res.render('admin/add-product',
	 {
	 docType: 'Add Product',
	 mypath: '/admin/add-product',
	 errorMessage: null,
	 product:{
		 		title: '',
		 		price: '',
		 		imageUrl: '',
		 		description: ''
		 	},
	validationErrors: []
	});

}



exports.postAddProduct = (req, res, next)=>{
	

		if(!req.file){

		return res.status(422).render('admin/add-product', {
		 docType: 'Add Product',
		 mypath: '/admin/add-product',
		 errorMessage: 'Image required',
		 product:{
		 		title: req.body.title,
		 		price: req.body.price,
		 		description: req.body.description,
		 	},
		 validationErrors: []
		});

		}

		const errors = validationResult(req);

		if(!errors.isEmpty()){
			console.log(errors.array());
		return res.status(422).render('admin/add-product', {
		 docType: 'Add Product',
		 mypath: '/admin/add-product',
		 errorMessage: errors.array()[0].msg,
		 product:{
		 		title: req.body.title,
		 		price: req.body.price,
		 		description: req.body.description,
		 	},
		 validationErrors: errors.array()
		});

		}


		const product = new Product({
			title: req.body.title,
			price: req.body.price,
			imageUrl: req.file.path,
			description: req.body.description,
			userId: req.user._id
		});
			console.log(req.file);
		product.save()
		.then(result=>{
			console.log('Product Created');
			res.redirect('/')
		}).catch(err=>{

		const error = new Error(err);
		err.httpStatusCode = 500;
		return next(error); 

		});
}


exports.getProducts = (req, res, next)=>{
	
	 Product.find({userId: req.user._id})
	 // .select('title price -_id')
	 .populate('userId')
	 .then((products)=>{
	 	console.log(products);
	 	console.log(req.session.isLoggedIn);
		res.render('admin/product-list', {prods: products,
		 docType: 'Admin Products',
		 mypath: '/admin/products',
		 // csrfToken: req.csrfToken()
		});
	}).catch(err=>{

		const error = new Error(err);
		err.httpStatusCode = 500;
		return next(error); 

	});


}



exports.getEditProduct = (req, res, next)=>{



	const editMode = req.query.editing;
	if(!editMode){
		return res.redirect('/')
	}
	const id = req.params.id
	

	Product.findById(id)
	.then(product=>{


		if (product.userId.toString() !== req.user._id.toString()) {
			return res.redirect('/');
		}
	res.render('admin/edit-product', {product: product,
	 docType: 'Edit Product',
	  mypath: '/admin/add-product',
	   editing: editMode,
	   hasError: false,
      errorMessage: null,
      validationErrors: []
		});
	});


}

exports.postEditProduct = (req, res, next) => {
	


	const prodId = req.body.product_id;
	const title = req.body.title;
	const image = req.file;
	const price = req.body.price;
	const description = req.body.description;
	

	const errors = validationResult(req);

  	if (!errors.isEmpty()) {
    		console.log(errors.array());
			    return res.status(422).render('admin/edit-product', {
			      docType: 'Edit Product',
				  mypath: '/admin/add-product',
			      editing: true,
			      hasError: true,
			      product: {
			        title: title,
			        price: price,
			        description: description
			      },
			      errorMessage: errors.array()[0].msg,
			      validationErrors: errors.array()
			    });
		  }




	Product.findById(prodId).then(product=>{

		if (product.userId.toString() !== req.user._id.toString()) {
			return res.redirect('/');
		}

		product.title = title;
		if(image){
		fileHelper.deleteFile(product.imageUrl);
		product.imageUrl = image.path;	
		}
		product.price = price;
		product.description = description;
		product.userId = req.user._id

		return product.save();
	}).then(result=>{
		console.log('Updated');
		res.redirect('/products');
	}).catch(err=>{

		const error = new Error(err);
		err.httpStatusCode = 500;
		return next(error); 

	});

}

exports.postDeleteProduct = (req, res, next) => {
	
	// Product.findByIdAndRemove(req.body.product_id).then(()=>{

		Product.findById(req.body.product_id).then(prod=>{
			if (!prod) {
				return next(new Error('Product dosen"t exist.'))
			}
			fileHelper.deleteFile(prod.imageUrl);
			Product.deleteOne({_id: req.body.product_id, userId: req.user._id})
			}).then(()=>{
				res.redirect('/admin/products');		
			})
			.catch(err=>{
	
		const error = new Error(err);
		err.httpStatusCode = 500;
		return next(error); 

		});


}
