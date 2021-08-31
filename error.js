const sum = (a, b)=>{
	if(a && b){
		return a+b;
	}
	throw new Error('Invalid arguments passed')
};




	try{
		console.log(sum(2))

	}catch(error){
		console.log('Error Detected');
		// console.log(error);
	}


// Errors and http respose code

// 2xx success  200  success
// 2xx success  201  success, resourse created
	



// 3xx redirect  301  moved permanently

// 4xx client side error  401  not authenticated
// 4xx client side error  403  not authorized
// 4xx client side error  404  not found
// 4xx client side error  422  invalid input

// 5xx client side error  500  server side error
