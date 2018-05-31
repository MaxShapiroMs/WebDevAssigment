//this is only an example, handling everything is yours responsibilty !
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
app.use(cors());
var DButilsAzure= require('./DButils');
var jwt = require('jsonwebtoken');
var superSecret = new Buffer('superSecret','base64');
var RegisteredUsers=require('./RegisteredUsers');
var GeneralUsers=require('./GeneralUsers');
var General=require('./General');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/Gneral',function(req,res,next){
    DButilsAzure.execQuery("SELECT A.[PointOfInterestName],A.[review] as review1, B.[review] AS review2 into tbl4 FROM [UsersReviews] AS A LEFT JOIN [UsersReviews] AS B ON A.[PointOfInterestName]=B.[PointOfInterestName]" +
        "WHERE A.date> B.date AND A.date= (SELECT MAX(date) FROM [UsersReviews] AS C WHERE A.[PointOfInterestName]=C.[PointOfInterestName]) AND B.date=(SELECT MAX(date) from [UsersReviews] AS D WHERE B.[PointOfInterestName]=D.[PointOfInterestName] AND D.date<>A.date)")
        .then(DButilsAzure.execQuery("INSERT INTO tbl4 SELECT [UsersReviews].[PointOfInterestName],[UsersReviews].[review],null from [UsersReviews] where [PointOfInterestName] IN (SELECT [PointOfInterestName] from [UsersReviews] GROUP BY [PointOfInterestName] HAVING COUNT(review)=1)").then(next()))
});
app.use('/RegisteredUsers',function(req,res,next){
    DButilsAzure.execQuery("SELECT A.[PointOfInterestName],A.[review] as review1, B.[review] AS review2 into tbl4 FROM [UsersReviews] AS A LEFT JOIN [UsersReviews] AS B ON A.[PointOfInterestName]=B.[PointOfInterestName]" +
        "WHERE A.date> B.date AND A.date= (SELECT MAX(date) FROM [UsersReviews] AS C WHERE A.[PointOfInterestName]=C.[PointOfInterestName]) AND B.date=(SELECT MAX(date) from [UsersReviews] AS D WHERE B.[PointOfInterestName]=D.[PointOfInterestName] AND D.date<>A.date)")
        .then(DButilsAzure.execQuery("INSERT INTO tbl4 SELECT [UsersReviews].[PointOfInterestName],[UsersReviews].[review],null from [UsersReviews] where [PointOfInterestName] IN (SELECT [PointOfInterestName] from [UsersReviews] GROUP BY [PointOfInterestName] HAVING COUNT(review)=1)").then(next()))
});

app.use('/RegisteredUsers', function(req,res,next) {

    var token = req.body.token || req.query.token || req.headers['x-access-token'];
// decode token
    if (token) {
// verifies secret and checks exp
        jwt.verify(token, superSecret, function (err, decoded) {
            if (err) {
                return res.json({success: false, message: 'Failed to authenticate token.'});
            } else {
// if everything is good, save to request for use in other routes
// get the decoded payload and header
                var decoded = jwt.decode(token, {complete: true});
                req.decoded = decoded; // decoded.payload , decoded.header
                next();

            }
        });
   }

});



app.use('/General',General);
app.use('/GeneralUsers', GeneralUsers );
app.use('/RegisteredUsers',RegisteredUsers);




var port =3000;
app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});


//-------------------------------------------------------------------------------------------------------------------


