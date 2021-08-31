const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const userSchema = new Schema({
 
		name: {
			type: String,
			required: true
		},

		email: {
			type: String,
			required: true
		},

		password: {
			type: String,
			required: true
		},

		resetToken: String,

		resetTokenExpiry: Date,

		cart: {
			items : [
				{
				productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
				quantity: { type: Number, required: true }
				}
			]
		}
});

userSchema.methods.addToCart = function(product){


	// console.log(this.cart);

	const cartProduct = this.cart.items.findIndex(cp =>{
			return cp.productId.toString() === product._id.toString();
		});

		let newQuantity = 1;

		const updatedCartItems = [...this.cart.items];

		if(cartProduct >= 0){

			newQuantity = this.cart.items[cartProduct].quantity + 1;
			
			updatedCartItems[cartProduct].quantity = newQuantity;
		
		}else{
			
			updatedCartItems.push({ productId: product._id, quantity: newQuantity})	
		
		}

		
		const updatedCart = { items: updatedCartItems };

		this.cart = updatedCart;
		return this.save();
};





userSchema.methods.deleteCartItem = function(productId){
	// console.log(this)
	 const updateCartItems = this.cart.items.filter(item=>{
	 		return item.productId.toString() !== productId.toString();
		});
	 console.log(updateCartItems);
	 	this.cart.items = updateCartItems;
	 	return this.save();
	}


userSchema.methods.clearCart = function(){
		this.cart = { items: []}
	 	return this.save();
	}


module.exports = mongoose.model('User', userSchema);