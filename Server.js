var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
//app.set('views',__dirname + '/views');
var path = require('path');
var adminRoutes = require('./routes/admin');
var shopRoutes = require('./routes/shop');

var app = express();

app.set('view engine', 'ejs');

//false: querystring
//true: qs
app.use(bodyParser.urlencoded({ extended: true }));
//http://localhost:3000/css/main.css
app.use(express.static(path.join(__dirname, 'public')));
//http://localhost:3000/abc => package till public
// http://localhost:3000/abc/css/main.css 
// app.use('/abc', express.static(path.join(__dirname, 'public')));
//http://localhost:3000/abc => css folder
//http://localhost:3000/abc/main.css
// app.use('/abc', express.static(path.join(__dirname, 'public', 'css')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);



// app.use((err, req, res, next) => {
//     res.status(500).send('Something Broke!');
// });

//var express=require('express');
//var app=express();
var mysql=require('mysql');
var connection = require('./database');
var { Router } = require('express');
app.set('views',__dirname + '/views');
app.use(express.static(__dirname + '/JS'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
var cookieSession = require('cookie-session');
var bcrypt = require('bcrypt');



         
app.get('/search',function(req,res){
    connection.query('SELECT first_name from users where first_name like "%'+req.query.key+'%"',
    function(err, rows, fields) {
    if (err) throw err;
    var data=[];
  var s;
   
    for(i=0;i<rows.length;i++)
    {
   s=data.push(rows[i].first_name);
   // console.log(rows);
   // console.log(s);
   

    //if(data.toString() == "Sahil")
    //{
     // console.log("SUCCESS");
      
    
      
        //res.redirect('s.html');
   
        //res.render('/s.ejs');


   // }
    }
 //   res.redirect('/s.ejs');

    res.end(JSON.stringify(data));
   console.log(s);

   /*if(data.toString() == "Sunny")
   {
           console.log("SUCCESS 2222");
           app.get('/sr',function(req,res){
              res.render('s.ejs');
           });
   } */
   
    if(data.toString() == "Apple")
    {
            console.log("SUCCESS 2222");
            app.get('/sr',function(req,res){
              
               
           
                //const Product = require('./models/product');
               // res.render('product-detail', { name: 'Tina', path: '/admin/product-detail', pageTitle: 'Add Product' });
               const Product = require('./models/product');
               const products = Product.findAll();
               res.render('index1', { name: 'Josh', prods: products, path: '/', pageTitle: 'Home' });
               
               //console.log(products);
             
              
             //S exports.getProductDetail = (req, res, next) => {
                //const products = Product.findById(req.params.prodId);
                //res.render('product-detail', { prod: products[0], pageTitle: 'Product Detail', path: '/', name: 'Edward' });
            //}
          //  res.render('product-detail');
               
            
               // res.redirect('/');
              // res.redirect('/products/');
              // <li class="nav-item <%= path==='/cart' ? 'active' : ''%>">
                //    <a class="nav-link" href="/cart">Cart</a>
                //</li>
               
            });
    }
    
});
});


app.use(express.urlencoded({extended:false}));
   

const { body, validationResult } = require('express-validator');
// APPLY COOKIE SESSION MIDDLEWARE
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge:  3600 * 1000 // 1hr
}));

// DECLARING CUSTOM MIDDLEWARE
const ifNotLoggedin = (req, res, next) => {
  if(!req.session.isLoggedIn){
      return res.render('login-register');
  }
  next();
}

const ifLoggedin = (req,res,next) => {
  if(req.session.isLoggedIn){
      return res.redirect('/home');
  }
  next();
}
// END OF CUSTOM MIDDLEWARE



app.get('/sun',function(req,res){
  
  res.render(path.join(__dirname+'/views/login-register.ejs'));
});




app.get('/sr4',function(req,res){
  
  res.sendFile(path.join(__dirname+'/index.html'));
});
app.get('/sr2',function(req,res){
    
  res.render(path.join(__dirname+'/views/home.ejs'));
});





app.get('/login-register', ifNotLoggedin, (req,res,next) => {
  connection.execute("SELECT `name` FROM `users1` WHERE `id`=?",[req.session.userID])
  .then(([rows]) => {
      res.render('home',{
          name:rows[0].name
      });
  });
  
});
// REGISTER PAGE
app.post('/register', ifLoggedin, 
// post data validation(using express-validator)
[
  body('user_email','Invalid email address!').isEmail().custom((value) => {
      return connection.execute('SELECT `email` FROM `users1` WHERE `email`=?', [value])
      .then(([rows]) => {
          if(rows.length > 0){
              return Promise.reject('This E-mail already in use!');
          }
          return true;
      });
  }),
  body('user_name','Username is Empty!').trim().not().isEmpty(),
  body('user_pass','The password must be of minimum length 6 characters').trim().isLength({ min: 6 }),
],// end of post data validation
(req,res,next) => {

  const validation_result = validationResult(req);
  const {user_name, user_pass, user_email} = req.body;
  // IF validation_result HAS NO ERROR
  if(validation_result.isEmpty()){
      // password encryption (using bcrypt)
      bcrypt.hash(user_pass, 12).then((hash_pass) => {
          // INSERTING USER INTO DATABASE
          connection.execute("INSERT INTO `users1`(`name`,`email`,`password`) VALUES(?,?,?)",[user_name,user_email, hash_pass])
          .then(result => {
              res.send(`your account has been created successfully, Now you can <a href="/">Login</a>`);
          }).catch(err => {
              // THROW INSERTING USER ERROR'S
              if (err) throw err;
          });
      })
      .catch(err => {
          // THROW HASING ERROR'S
          if (err) throw err;
      })
  }
  else{
      // COLLECT ALL THE VALIDATION ERRORS
      let allErrors = validation_result.errors.map((error) => {
          return error.msg;
      });
      // REDERING login-register PAGE WITH VALIDATION ERRORS
      res.render('login-register',{
          register_error:allErrors,
          old_data:req.body
      });
  }
});// END OF REGISTER PAGE

// LOGIN PAGE
app.post('/login', ifLoggedin, [
  body('user_email').custom((value) => {
      return connection.execute('SELECT `email` FROM `users1` WHERE `email`=?', [value])
      .then(([rows]) => {
          if(rows.length == 1){
              return true;
              
          }
          return Promise.reject('Invalid Email Address!');
          
      });
  }),
  body('user_pass','Password is empty!').trim().not().isEmpty(),
], (req, res) => {
  const validation_result = validationResult(req);
  const {user_pass, user_email} = req.body;
  if(validation_result.isEmpty()){
      
      connection.execute("SELECT * FROM `users1` WHERE `email`=?",[user_email])
      .then(([rows]) => {
          bcrypt.compare(user_pass, rows[0].password).then(compare_result => {
              if(compare_result === true){
                  req.session.isLoggedIn = true;
                  req.session.userID = rows[0].id;

                  res.redirect('/');
              }
              else{
                  res.render('login-register',{
                      login_errors:['Invalid Password!']
                  });
              }
          })
          .catch(err => {
              if (err) throw err;
          });


      }).catch(err => {
          if (err) throw err;
      });
  }
  else{
      let allErrors = validation_result.errors.map((error) => {
          return error.msg;
      });
      // REDERING login-register PAGE WITH LOGIN VALIDATION ERRORS
      res.render('login-register',{
          login_errors:allErrors
      });
  }
});
// END OF LOGIN PAGE

// LOGOUT
app.get('/logout',(req,res)=>{
  //session destroy
  req.session = null;
  res.redirect('/');
});
// END OF LOGOUT



    var server=app.listen(3000,function(){
            console.log("We have started our server on port 3000");
        });