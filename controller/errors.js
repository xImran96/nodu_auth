exports.get404 = (req, res, next)=>{
	res.render('404', {docType: "Page not found",
					isAuthenticated: req.isLoggedIn
					});
};



exports.get500 = (req, res, next)=>{
	res.render('500', {docType: "Error!",
					isAuthenticated: req.isLoggedIn
					});
}