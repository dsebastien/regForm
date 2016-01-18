<?php

$app->get('/confirm_registration/{uuid}', function($request, $response, $args) {
	$uuid = null;
	try{
		ensureThatKeyExists("uuid", $args);
		$uuid = $args["uuid"];
        $uuid = ensureNotEmpty($uuid);
        $uuid = ensureIsUUID($uuid);
	}catch(Exception $e){
		$response = $response->withStatus(400);
        return $response;
	}
	
	// received a valid UUID
	// check the database to see if it is known
	$escapedUuid = $dbConnection->real_escape_string($uuid);
	
	$dbConnection = getDatabaseConnection();
	
	$registrationExists = false;
	$registrationAlreadyConfirmed = false;
	
	$sql = "SELECT confirmed FROM `foire_vetements` WHERE uuid = '$escapedUuid'";
	
	$result = null;
	if(!$result = $dbConnection->query($sql)){
		throw new Exception("There was an error running the query. Error: ".$dbConnection->error);
	}
	
	while($row = $result->fetch_assoc()){
		$registrationExists = true;
		$registrationAlreadyConfirmed = $row['confirmed'];
	}
	$result->free();
    	
	if($registrationExists){
		$response->write("Registration exists!");
	}
	
	if($registrationAlreadyConfirmed){
		$response->write("\nRegistration already confirmed!");
	}
	
	
	
	
	
	
	
	
	return $response;
})->setName("confirm_registration");

?>
