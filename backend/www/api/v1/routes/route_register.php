<?php

$app->post('/register', function($request, $response) {
	// This allows users to register
	
	// First, we need to check if the request has a valid token attached
	// FIXME put back once ready
	/*
	$response = checkToken($request, $response);
	
    if($response->getStatusCode() != 200){
		// Sorry, better luck next time!
		return $response;
	}
	*/

	// if we're still here it means that the token was provided and valid
	$input = null;
	try{
		$input = $request->getParsedBody();
		if($input === null){
			throw new Exception("The input must be incorrect. Conversion failed or there was no input!");
		}
		// ok: the input is present and could be converted to an associative array
	} catch (Exception $e) {
		$response = $response->withStatus(400);
		return $response;
    }
    
    // get provided input
    $firstName = null;
    $lastName = null;
    $email = null;
    $phone = null;
    $slots = null;
    $member = null;
    $waitList = null;
    
    try{
    	// check that all the required input has been provided
    	ensureThatKeyExists("firstName", $input);
    	ensureThatKeyExists("lastName", $input);
    	ensureThatKeyExists("email", $input);
    	ensureThatKeyExists("phone", $input);
    	ensureThatKeyExists("slots", $input);
    	ensureThatKeyExists("member", $input);
    	ensureThatKeyExists("waitList", $input);
    	
    	// get the values
    	$firstName = $input["firstName"];
    	$lastName = $input["lastName"];
    	$email = $input["email"];
    	$phone = $input["phone"];
    	$slots = $input["slots"];
    	$member = $input["member"];
    	$waitList = $input["waitList"];
    	
    	// the values should not be undefined, null or empty
    	// also trims any begin/end extra whitespace
    	$firstName = ensureNotEmpty($firstName);
    	$lastName = ensureNotEmpty($lastName);
    	$email = ensureNotEmpty($email);
    	// phone can be empty
    	
    	// ensure that email is an email
    	$email = ensureIsEmail($email);
    	
    	// ensure that slots is numeric
    	if(!is_numeric($slots)){
    		throw new Exception("Slots must be numeric");
    	}
    	
    	// ensure that slots is in the accepted range: [1-4]
    	if($slots < 1 || $slots > 2){
    		throw new Exception("Slots is not within the accepted range");
    	}
    	
    	// ensure that member is a boolean 
    	if(!is_bool($member)){
    		throw new Exception("Member must be a boolean!");
    	}
    	
    	// ensure that waitList is a boolean
    	if(!is_bool($waitList)){
			throw new Exception("WaitList must be a boolean!");
		}
    } catch(Exception $e){
    	$response = $response->withStatus(400);
    	return $response;
    }
   
    // at this point we can consider that the input is valid (not necessarily safe yet to use)
    
    // load DB configuration
	// adapt the path depending on where the file is located
    $dbConfiguration = parse_ini_file("../../../db-secrets.ini");
    $dbConnection = new mysqli($dbConfiguration["host"], $dbConfiguration["username"], $dbConfiguration["password"], $dbConfiguration["name"]);
    if($dbConnection->connect_error){
    	throw new Exception("Could not connect to the database. Error: ".$dbConnection->connect_error);
    }
    
    $emailEscaped = $dbConnection->real_escape_string($email);
    
    // check if the email is already known
    // FIXME eliminate duplication w/ route_email_check
    $sql = "SELECT id FROM `foire_vetements` WHERE email = '$emailEscaped'";
    
    //http://localhost:8080/register
	
    $result = null;
    if(!$result = $dbConnection->query($sql)){
    	throw new Exception("There was an error running the query: ".$dbConnection->error);
    }
	
	$emailAlreadyKnown = false;
    while($row = $result->fetch_assoc()){
       	$emailAlreadyKnown = true;
    }
    $result->free();
    
    if($emailAlreadyKnown === true){
    	$response = $response->withStatus(409);
    	$response = $response->withHeader('Content-type', 'application/json');
    	$responseBodyEmailAlreadyRegistered = array('email_already_registered' => $email);
    	$response->write(json_encode($responseBodyEmailAlreadyRegistered));
    	return $response;
    }
    
    // check the remaining slots
    // FIXME eliminate duplication w/ route_slots_remaining
    $totalSlots = 0;
    $usedSlots = 0;
    $remainingSlots = 0;
    	
    // get total slots
    $sql = 'SELECT total_slots FROM `foire_vetements_meta`';
    	
    $result = null;
    if(!$result = $dbConnection->query($sql)){
    	throw new Exception("There was an error running the query. Error: ".$dbConnection->error);
	}
        
	while($row = $result->fetch_assoc()){
		$totalSlots = $row['total_slots'];
	}
	$result->free();
    	
	// get used slots (i.e., slots reserved by people who have confirmed and are not on the wait list)
	$sql = 'SELECT SUM(slots) FROM `foire_vetements` WHERE confirmed = 1 AND on_wait_list = 0';
    	
	$result = null;
	if(!$result = $dbConnection->query($sql)){
		throw new Exception("There was an error running the query: ".$dbConnection->error);
	}
    	
	while($row = $result->fetch_assoc()){
		$usedSlots = $row[0];
	}
	$result->free();
    	
	// make sure that we define a value
	if($usedSlots == ""){
		$usedSlots = 0;
	}
        
	// calculate the remaining slots
	$remainingSlots = $totalSlots - $usedSlots;
	
    // if the user requests too many slots
    if($slots > $remainingSlots && !$waitList){
    	$response = $response->withStatus(409);
		$response = $response->withHeader('Content-type', 'application/json');
        $responseBodyNotEnoughSlotsAvailable = array('not_enough_slots_available' => $remainingSlots);
        $response->write(json_encode($responseBodyNotEnoughSlotsAvailable));
        return $response;
    }
    
    
    
    // close the connection
    $dbConnection->close();
    
	return $response;
})->setName("register");

?>
