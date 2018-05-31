var express=require('express');
var router=express.Router();
var DButilsAzure= require('./DButils');
var jwt= require('jsonwebtoken');
var superSecret = new Buffer('superSecret','base64');
var xmlReader = require('xml2js');
var fs = require('fs');


router.post('/Register',function (req,res){
    let user=req.body;
    if(!user){
        DButilsAzure.execQuery("DROP TABLE tbl4").then(res.send("user failure"));
    }
    if(!validateEmail(user.Email))
        Promise.reject('unvalid mail adress');
    //check that user name length is between 3 to 8
    if(user.UserName.length<3 || user.UserName.length>8)
       return Promise.reject('User name length should be between 3 to 8 chars');
    //check that user name is just letters
    var letters = /^[A-Za-z]+$/;
    if(!user.UserName.match(letters))
        return Promise.reject('User name should contain only letters');
    // check that password length between 5 to 10
    if(user.Password.length<5 || user.Password.length>10)
        return Promise.reject('User name length should be between 3 to 8 chars');
    var passwordRule =  /^[a-zA-Z0-9]+$/;
    if(!user.Password.match(passwordRule))
        return Promise.reject('invalid password- password should contanin numbers and letters only');

    //checking thatc the DB dosent contain that user name
    DButilsAzure.execQuery("SELECT * FROM Users Where UserName=\'" + user.UserName + "\';")
        .then(function(ans){
            if(ans.length > 0)
                return Promise.reject('There is already a user with the same username');})
        .then(function (ans){
            console.log(user.UserName);
            var query= "INSERT INTO Users (UserName,FirstName,LastName,City,Country,Email,Password) VALUES (\'"+user.UserName+"\',\'"+user.FirstName+"\',\'"+user.LastName+"\',\'"+user.City+"\',\'"+user.Country+"\',\'"+user.Email+"\',\'"+user.Password+"\')";



            DButilsAzure.execQuery(query);
        })
        .then(ans=> addUserCategory(user.UserName,user.Categories))
        .then(ans=> addUserQuestion(user.UserName,user.Questions, user.Answers))
        .then(res.send(true))
        .catch(ans=> res.send(false));
});

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function addUserCategory (userName, categories)
{

    for(var i=0; i< categories.length; i++ )
    {
        var query= "INSERT INTO UsersCategory (UserName, Category) Values (\'"+userName+"\',\'"+categories[i]+"\')";
        DButilsAzure.execQuery(query);
    }
    return true;
};

function addUserQuestion (userName, questions, answers)
{

    for(var i=0; i< questions.length; i++ )
    {

        var query= "INSERT INTO UserQuestions (UserName, Question, Answer) Values (\'"+userName+"\',\'"+questions[i]+"\',\'"+answers[i]+"\')";
        DButilsAzure.execQuery(query);
    }
    return true;
};
router.post('/logIn',function (req,res) {
    var userToCheck=req.body;
    if(!userToCheck){
        res.send("login failure");
        res.end();
    }
    console.log(userToCheck.UserName);
    DButilsAzure.execQuery("select Password from Users where UserName=\'"+userToCheck.UserName+"\'")
        .then(function(ans) {
            if (ans.length == 0)
                return Promise.reject('Wrong Username');
            else if (!(ans[0].Password == userToCheck.Password)) {
                return Promise.reject('Wrong Password');
            }

            var payload = {
                userName: userToCheck.UserName
            }
            var token = jwt.sign(payload, superSecret, {
                expiresIn: "1d" // expires in 24 hours
            });
            // return the information including token as
            JSON
            res.json({
                token: token
            });
            res.end();
        })
        .catch(ans=>res.send("" +ans));
});

router.post('/passwordRetrival',function (req,res) {
    var params=req.body;
    DButilsAzure.execQuery("select Answer from UserQuestions where UserName=\'" + params.UserName + "\' AND Question=\'"+params.Question+"\'")
        .then(function(ans){
            if(ans.length==0)
                return Promise.reject('Wrong Username or question');
            if(ans[0].Answer!= params.Answer)
                return Promise.reject('Wrong answer');

            DButilsAzure.execQuery("select Password from Users where UserName=\'" + params.UserName + "\'")
                .then(function (ans) {

                    if (ans.length == 0)
                        return Promise.reject('Wrong Username');
                    else
                    //return Promise.resolve(ans[0].Password);
                        res.send(ans[0].Password);

                })
                .catch(err => res.send(err));
        })
        .catch(err => res.send(err));
});



module.exports=router;
