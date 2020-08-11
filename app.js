require('dotenv').config();
const express= require("express");
const bodyParser= require("body-parser");
const mongoose= require("mongoose");
const parseString = require('xml2js').parseString;

const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const fetch = require("node-fetch");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const app= express();

//Initialization of amadeus
var Amadeus = require('amadeus');

var amadeus = new Amadeus({
  clientId: process.env.API_KEY,
  clientSecret: process.env.API_SECRET
});


app.listen(3000, function(){
  console.log("Server connected successfully!");
})

app.get("/flights", function (req, res){

  var length=10;
  amadeus.shopping.flightOffersSearch.get({
   originLocationCode: 'BOS',
   destinationLocationCode: 'CMB',
   departureDate: '2020-08-20',
   adults: '2'
}).then(response => {

    var result=[];

    var data= response.data;

    //Sorting the data in asceding order to get the cheapest flights
    data.sort(function(a, b){
      return a.price.total - b.price.total;
    })
    // In case search parameters don't get more than 10 results
    if (data.length>= 10){
      for (var i=0; i< 10; i++){
        var search= {
          id: i,
          lastTicketDate: data[i].lastTicketingDate,
          bookableSeats: data[i].numberOfBookableSeats,
          price: data[i].price.total,
          itinerary: data[i].itineraries,
        }
        result.push(search);
      }
    }
    else {
      for (var i=0; i< data.length; i++){
        var search= {
          id: i,
          lastTicketDate: data[i].lastTicketingDate,
          bookableSeats: data[i].numberOfBookableSeats,
          price: data[i].price.total,
          itinerary: data[i].itineraries,
        }
        result.push(search);
      }
    }

    res.send(result);
  }).catch(error => {
    console.log(error.response); //=> The response object with (un)parsed data
    //console.log(error.response.request); //=> The details of the request made
    console.log(error.code); //=> A unique error code to identify the type of error
  });

});

app.get("/news", function(req, res){
  const url= 'http://www.adaderana.lk/rss.php';
  var xml = fetch(url)
           .then(res => res.text())
           .catch(error => console.log(error));

  xml.then(function(object){
        parseString(object, function(err, result){
          res.send(result);
        })
      })


});
