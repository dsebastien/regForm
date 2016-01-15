<?php

$app->post('/register', function($request, $response) {
	// This allows users to register
	
	// First, we need to check if the request has a valid token attached
	$response = checkToken($request, $response);
	
    if($response->getStatusCode() != 200){
		// Sorry, better luck next time!
		return $response;
	}
	
	$response->write("Authorization OK");
    	
    //$name = strip_tags($request->getAttribute("name"));
    //$city = $mysqli->real_escape_string($city);
    //$name = htmlentities($name);
	
	// if we're still here it means that the token was provided and valid
	
	
	
	/*
	// load DB configuration
	// adapt the path depending on where the file is located
	$dbConfiguration = parse_ini_file("../../../db-secrets.ini");
	$dbConnection = new mysqli($dbConfiguration["host"], $dbConfiguration["username"], $dbConfiguration["password"], $dbConfiguration["name"]);
	
	if($dbConnection->connect_error){
		throw new Exception("Could not connect to the database. Error: ".$dbConnection->connect_error);
	}
	*/
	
	return $response;
})->setName("register");

?>
