var express=require('express');
var router=express.Router();
var DButilsAzure= require('./DButils');
var jwt= require('jsonwebtoken');
new Buffer('superSecret','base64');


// return the two most popular point of viewa in two diffrent categories te user chose when he registered
router.get('/GetTwoPopularPointsInDiffrentCategories',function(req,res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var decoded=jwt.decode(token, {complete:true});
    req.decoded = decoded;
    let Username=decoded.payload.userName;
    DButilsAzure.execQuery("select Top 2 Category from UsersCategory where UserName=\'"+Username+"\'")
        .then(function (ans){

            var categories=ans;
            DButilsAzure.execQuery("select top 1 PointsOfInterest.*,tbl4.review1,tbl4.review2 from PointsOfInterest left join tbl4 on PointsOfInterest.Name=tbl4.[PointOfInterestName]  where Category='"+categories[0].Category+"'")
                .then(function (ans){
                    var ans1=[];
                    ans1[0]=ans[0];
                    DButilsAzure.execQuery("select top 1 PointsOfInterest.*,tbl4.review1,tbl4.review2 from PointsOfInterest left join tbl4 on PointsOfInterest.Name=tbl4.[PointOfInterestName] where Category=\'"+categories[1].Category+"\'" +
                        "Order By Number_of_views DESC")
                        .then(DButilsAzure.execQuery("DROP TABLE tbl4").then())

                        .then(ans=>res.send(ans1.concat(ans[0])));


                })
                .catch(err => res.send(err));
        })
        .catch(err => res.send(err));

});

// return the two last points of interest the user saved
router.get('/GetTwoLastSavedPointOfUser',function(req,res){
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var decoded=jwt.decode(token, {complete:true});
    req.decoded = decoded;
    let Username=decoded.payload.userName;
    DButilsAzure.execQuery( "SELECT TOP 2 PointOfInterestName FROM UsersPointOfInterest WHERE UserName=\'"+Username+"\' ORDER BY Date DESC")
        .then(function (ans){
            var poi=ans;
            console.log(poi[1]);
            DButilsAzure.execQuery( "SELECT PointsOfInterest.*,tbl4.review1 ,tbl4.review2 FROM PointsOfInterest left join tbl4 on PointsOfInterest.name=tbl4.[PointOfInterestName]  WHERE Name=\'"+poi[0].PointOfInterestName+"\'")
                .then(function (ans) {
                    var ans1=[];
                    ans1[0]=ans[0];
                    DButilsAzure.execQuery( "SELECT PointsOfInterest.*,tbl4.review1 ,tbl4.review2 FROM PointsOfInterest left join tbl4 on PointsOfInterest.name=tbl4.[PointOfInterestName] WHERE Name=\'"+poi[1].PointOfInterestName+"\'")
                        .then(DButilsAzure.execQuery("DROP TABLE tbl4").then())
                        .then(ans=>res.send(ans1.concat(ans[0])))
                        .catch(err => res.send(err));

                })
                .catch(err => res.send(err));
        })
        .catch(err => res.send(err));


});


// the function get point of interest and save it
router.post('/SavePointOfInterest',function(req,res){
    var params = req.body;
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var decoded=jwt.decode(token, {complete:true});
    req.decoded = decoded;
    let Username=decoded.payload.userName;
    var value=0;
     var query= "INSERT INTO UsersPointOfInterest (UserName, PointOfInterestName, Date, [Index]) Values ('"+Username+"','"+params.PointOfInterestName+"', GETDATE(),'"+value+"')";
     DButilsAzure.execQuery(query)
        .then( function(ans){DButilsAzure.execQuery("DROP TABLE tbl4").then(res.send(true))})
        .catch(function(err){DButilsAzure.execQuery("DROP TABLE tbl4").then(res.send(false))});



});

//unsave point of interest
router.delete('/UnsavePointOfInterest',function(req,res){
    var params = req.body;
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var decoded=jwt.decode(token, {complete:true});
    req.decoded = decoded;
    let Username=decoded.payload.userName;
    DButilsAzure.execQuery("DELETE FROM UsersPointOfInterest WHERE Username='"+Username+"'AND PointOfInterestName='"+params.PointOfInterestName+"'")
        .then( function(ans){DButilsAzure.execQuery("DROP TABLE tbl4").then(res.send(true))});
});

//return the user faivorite pointOf interest by his order
router.get('/getUsersFavoritePointsOfInterests',function(req,res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var decoded = jwt.decode(token, {complete: true});
    req.decoded = decoded;
    let Username = decoded.payload.userName;
    DButilsAzure.execQuery("SELECT [PointsOfInterest].* , [UsersPointOfInterest].[Index] into tabl2 FROM [PointsOfInterest] LEFT JOIN [UsersPointOfInterest] ON [PointsOfInterest].Name=[UsersPointOfInterest].[PointOfInterestName] WHERE UserName=\'" + Username + "\' ORDER BY [Index]")
        .then(function (ans) {
            DButilsAzure.execQuery("SELECT tabl2.[Name],tabl2.[Picture],tabl2.[Number_of_views],tabl2.[description],tabl2.[Rank],tabl2.[Category] ,tabl2.[NumberOfPeopleRanked], tbl4.review1,tbl4.review2 " +
                "FROM tabl2 LEFT JOIN tbl4 on tabl2.[Name]=tbl4.[PointOfInterestName]  ORDER BY tabl2.[Index] DESC ")
                .then(function (ans) {
                    DButilsAzure.execQuery(" DROP TABLE tabl2").then(function (ans){DButilsAzure.execQuery(" DROP TABLE tbl4")
                        .then()});
                    res.send(ans)
                })
        })

});

//update the index in usetPoint of interests table according to users preference
router.post('/OrgnizePointOfInterestByOrder', function(req,res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var decoded=jwt.decode(token, {complete:true});
    req.decoded = decoded;
    let Username=decoded.payload.userName;
    console.log(Username);
    var points=[];
    points=req.body.PointsOfInterests;
    for(i=points.length-1; i>=0; i--)
    {
        var point=points.length-1-i;
        var query="UPDATE [dbo].UsersPointOfInterest SET [Index]='"+ (i+1) +"' Where PointOfInterestName ='"+ points[point] + "' AND UserName= '"+ Username + "'";
        DButilsAzure.execQuery(query);
    }


});

router.post('/AddReviewToPointOfInterest',function(req,res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var decoded=jwt.decode(token, {complete:true});
    req.decoded = decoded;
    let Username=decoded.payload.userName;
    var params = req.body;
    var query= "INSERT INTO UsersReviews (UserName, PointOfInterestName,review,date) Values (\'"+Username+"\',\'"+params.PointOfInterestName+"\',\'"+params.review+"\',GETDATE())";
    DButilsAzure.execQuery(query)
        .then(function (ans){DButilsAzure.execQuery("DROP TABLE tbl4").then(res.send("true"))})
        .catch(function(err) {
            DButilsAzure.execQuery("DELETE FROM [UsersReviews] WHERE UserName= '" + Username + "' AND PointOfInterestName='" + params.PointOfInterestName + "'")
                .then(DButilsAzure.execQuery("DROP TABLE tbl4").then())
                .then(function (ans) {
                    DButilsAzure.execQuery("INSERT INTO UsersReviews (UserName, PointOfInterestName,review,date) Values ('" + Username + "','" + params.PointOfInterestName + "','" + params.review + "', GETDATE())")
                    .then(res.send(true))})
                    .catch(err => res.send(err))})

        });


// update the general rank in pointOfInterest according to the new
router.post('/RankPointOfInterest',function(req,res) {
    var params = req.body;
    var getRanksQuery = "SELECT Rank, NumberOfPeopleRanked FROM PointsOfInterest WHERE Name=\'"+params.PointOfInterestName+"\'";
    DButilsAzure.execQuery(getRanksQuery)
        .then(function(ans){

            var rank = ans[0].Rank*ans[0].NumberOfPeopleRanked;
            rank = ((rank+params.Rank*20))/(ans[0].NumberOfPeopleRanked+1);
            var Number=ans[0].NumberOfPeopleRanked+1;
            var query= "UPDATE PointsOfInterest SET Rank=\'"+rank+"\',NumberOfPeopleRanked=\'"+Number+"\'"+"WHERE Name=\'"+params.PointOfInterestName+"\'";
            DButilsAzure.execQuery(query)
                .then(DButilsAzure.execQuery("DROP TABLE tbl4").then())
                .then(res.send(true));
        })

});

module.exports=router;