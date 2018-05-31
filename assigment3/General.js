var express=require('express');
var router=express.Router();
var DButilsAzure= require('./DButils');
var jwt= require('jsonwebtoken');
new Buffer('superSecret','base64');


// return three random point of interest that their rank above 2 which means 40 precent
router.get('/ExploreThreeViewPoint',function(req,res) {
    DButilsAzure.execQuery( "SELECT TOP 3 [PointsOfInterest].*, tbl4.review1, tbl4.review2 FROM [PointsOfInterest] LEFT JOIN tbl4 ON PointsOfInterest.name=tbl4.[PointOfInterestName]   WHERE [PointsOfInterest].[Rank] >= 40 ORDER BY NEWID()")
        .then(DButilsAzure.execQuery("DROP TABLE tbl4").then())
        .then(ans=>res.send(ans))
        .catch(err => res.send(err));

});

//dosent working
router.get('/RetrivePointsOfInterestByCategory',function(req,res){
    DButilsAzure.execQuery( "SELECT [PointsOfInterest].*, tbl4.review1, tbl4.review2 FROM [PointsOfInterest] LEFT JOIN tbl4 ON PointsOfInterest.name=tbl4.[PointOfInterestName] ORDER BY Category ")
        .then(DButilsAzure.execQuery("DROP TABLE tbl4").then())
        .then(ans=>res.send(ans))
        .catch(err => res.send(err));

});

// return all points of interests
router.get('/RetriveAllPointsOfInterest',function(req,res){
    DButilsAzure.execQuery( "SELECT [PointsOfInterest].*, tbl4.review1, tbl4.review2 FROM [PointsOfInterest] LEFT JOIN tbl4 ON PointsOfInterest.name=tbl4.[PointOfInterestName]  ")
        .then(DButilsAzure.execQuery("DROP TABLE tbl4").then())
        .then(ans=>res.send(ans))
        .catch(err => res.send(err));

});
// return ll the details of certain point of interest
router.get('/GetPointOfInterestByName/:un',function(req,res){
    var POIName=req.params['un'];
    DButilsAzure.execQuery( "SELECT PointsOfInterest.* FROM PointsOfInterest LEFT JOIN tbl4 ON PointsOfInterest.name=tbl4.[PointOfInterestName] WHERE Name=\'"+POIName+"\' ")
        .then(ans=>res.send(ans))
        .catch(err => res.send(err));
});
module.exports=router;