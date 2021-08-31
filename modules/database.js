const mongodb = require('mongodb');
const MongoClient =  mongodb.MongoClient;


let _db;
const mongoConnect = callback =>{
	
		MongoClient.connect('mongodb+srv://x_imran96:DzEscqpvSnNyZTaL@cluster0.2asma.mongodb.net/shop?retryWrites=true&w=majority')
		.then(client=>{
			console.log('Connected To Mongo Cloud...');
			// callback(client);
			// console.log(client);
			_db = client.db();
			callback();
		}).catch(err=>{
			console.log(err);
		});


};

const getDb = ()=>{

	if(_db){
		return _db;
	}
	throw "No Database Exist...";
	
}

// module.exports = mongoConnect;

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;

