#! /usr/bin/env node

var request = require("request");
var args = require('minimist')(process.argv);
var moment = require('moment');
var fs = require("fs");

var header = "";
var pending = null;
var complete = 0;
var text = "";

if( args.s && args.e ){
			
		get311( moment( new Date(args.s) ), moment( new Date(args.e) )  );	
		

		
		interval = setInterval(function(){ 
			//console.log("Pending: " + pending + ", Complete: " + complete);
			if( pending == complete ){
				console.log(header + "\n" + text);
				clearInterval(interval);
			}
		}, 1000)
} else {
	//console.log("Need to specify start and end!");
}


function get311(start, end){
	pending ++;
	
	//console.log("Searching " + start.format("MM/DD/YYYY h:mm:ss A") + " to " + end.format("MM/DD/YYYY h:mm:ss A"))
	
	// You'll notice in the request that I subtract a day off the "end" part of the range. 
	// Don't ask me why I need to do that -- OCTO seems to pad the result by a day so this compensates.
	request("http://data.octo.dc.gov/Attachment.aspx?where=Citywide&area=&what=CSV&date=serviceorderdate&from=" + start.format("MM/DD/YYYY h:mm:ss A") + "&to=" + moment(end - moment.duration(1, 'days')).format("MM/DD/YYYY h:mm:ss A") + "&dataset=SRC&datasetid=4&whereInd=0&areaInd=0&whatInd=0&dateInd=0&whenInd=1", function(err, response, body){
		if( err ) throw err;
		
		if( body.indexOf("The requested dataset is too big and cannot be downloaded as a single file.") != -1){
			pending --;
			//console.log("File was apparently too big!");
			var diff = end - start;
			
			for( var i = 0; i <= 1; i++){
				get311( moment(start + moment.duration( diff * (i / 2) )), moment(start + moment.duration( diff * ((i + 1) / 2) )) );
			}
		} else {
			// Yay! we have CSV.
			//console.log("Got " + start.format("MM/DD/YYYY h:mm:ss A") + " to " + end.format("MM/DD/YYYY h:mm:ss A") + "!");
			//console.log("http://data.octo.dc.gov/Attachment.aspx?where=Citywide&area=&what=CSV&date=serviceorderdate&from=" + start.format("MM/DD/YYYY h:mm:ss A") + "&to=" + moment(end - moment.duration(1, 'days')).format("MM/DD/YYYY h:mm:ss A") + "&dataset=SRC&datasetid=4&whereInd=0&areaInd=0&whatInd=0&dateInd=0&whenInd=1");
			complete++;
			
			fs.writeFile(complete + "party.csv", body);
			
			header = (body.slice(0, body.indexOf("\n")));
			body = body.substring(body.indexOf("\n") + 1);
			text += body;
			
			
			
		}
		
		
		
	});

}

