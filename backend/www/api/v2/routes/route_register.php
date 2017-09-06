<?php

$app->post('/register', function($request, $response) {
	// This allows users to register
	
	// First, we need to check if the request has a valid token attached
	if($production){
		$response = checkToken($request, $response);
    
    	if($response->getStatusCode() != 200){
			// Sorry, better luck next time!
			return $response;
		}
	}

	// if we're still here it means that the token was provided and valid
	$input = null;
	try{
		$input = $request->getParsedBody();
		if($input === null){
			if(!$production){
				echo "Failed input validation during registration";
				exit;
			}
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
    $city = null;
    $phone = null;
    $slots = null;
    $member = null;
    $memberNumber = null;
    $waitList = null;
    
    try{
    	// check that all the required input has been provided
    	ensureThatKeyExists("firstName", $input);
    	ensureThatKeyExists("lastName", $input);
    	ensureThatKeyExists("email", $input);
    	ensureThatKeyExists("city", $input);
    	ensureThatKeyExists("phone", $input);
    	ensureThatKeyExists("slots", $input);
    	ensureThatKeyExists("member", $input);
    	ensureThatKeyExists("memberNumber", $input);
    	ensureThatKeyExists("waitList", $input);
    	
    	// get the values
    	$firstName = $input["firstName"];
    	$lastName = $input["lastName"];
    	$email = $input["email"];
    	$city = $input["city"];
    	$phone = $input["phone"];
    	$slots = $input["slots"];
    	$member = $input["member"];
    	$memberNumber = $input["memberNumber"];
    	$waitList = $input["waitList"];
    	
    	// the values should not be undefined, null or empty
    	// also trims any begin/end extra whitespace
    	$firstName = ensureNotEmpty($firstName);
    	$lastName = ensureNotEmpty($lastName);
    	$email = ensureNotEmpty($email);
    	$city = ensureNotEmpty($city);
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
    	}else if($member === true){
    	 	if(!is_numeric($memberNumber)){
    			throw new Exception("If member is true, then member number must be provided and must be numeric!");
    		}
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
        
    $dbConnection = getDatabaseConnection();
    
    $escapedEmail = $dbConnection->real_escape_string($email);
    
    // check if the email is already known
    $sql = "SELECT id FROM `foire_vetements` WHERE email = '$escapedEmail'";
	
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
    // Get the slots information
    $slotsInformation = getSlotsInformation();
    
    // determine if there are enough slots available
	$enoughSlotsAvailable = $slots <= $slotsInformation["remainingSlots"];
	
    // if the user requests too many slots
    if(!$enoughSlotsAvailable && !$waitList){
    	$response = $response->withStatus(409);
		$response = $response->withHeader('Content-type', 'application/json');
        $responseBodyNotEnoughSlotsAvailable = array('not_enough_slots_available' => $slotsInformation["remainingSlots"]);
        $response->write(json_encode($responseBodyNotEnoughSlotsAvailable));
        return $response;
    }
    
    // w00t, everything looks ready, time to save the registration!
	
    // We need a unique ID
	$uuid = generateUUID();
	$escapedUuid = $dbConnection->real_escape_string($uuid);
	
	// Make sure that all input is correctly encoded/escaped before using them in a query
	$escapedFirstName = $dbConnection->real_escape_string($firstName);
	$escapedLastName = $dbConnection->real_escape_string($lastName);
	$escapedPhone = $dbConnection->real_escape_string($phone);
	$escapedCity = $dbConnection->real_escape_string($city);
	//$escapedEmail (already defined above)
	
	// the other input values don't need escaping, we've checked them already (number & booleans)
	// slots
	// member
	// waitList
	
	$escapedMemberNumber = $dbConnection->real_escape_string($memberNumber);
	
	// member and waitList being booleans, they need to be converted to int values before insertion
	$memberAsInteger = convertBooleanToInt($member);
	$waitListAsInteger = convertBooleanToInt($waitList);
	
	// finally, we need the client's IP
	$clientIP = getClientIP();
	
	$sql = "INSERT INTO `foire_vetements` (uuid, first_name, last_name, email, city, phone_number, slots, member, member_number, on_wait_list, confirmed, created_on, client_ip) VALUES ('$uuid', '$escapedFirstName', '$escapedLastName','$escapedEmail', '$escapedCity', '$escapedPhone', $slots, $memberAsInteger, '$escapedMemberNumber', $waitListAsInteger, 1, now(), '$clientIP')";
	
	$result = null;
	if(!$result = $dbConnection->query($sql)){
    	throw new Exception("There was an error running the query: ".$dbConnection->error);
    }
	
	// registration saved successfully
	//$baseURL = getBaseURL();
    //$registrationConfirmedURL = $baseURL . "/liguefamjurbise/#/registrationConfirmation";
    //$registrationFullURL = $baseURL . "/liguefamjurbise/#/registrationFull";
	
	// load mail configuration
    // adapt the path depending on where the file is located
    $emailConfiguration = parse_ini_file("../mail-configuration-v2.ini");
    
    $emailFrom = $emailConfiguration["from"];
    $emailFromName = $emailConfiguration["fromName"];
    $emailTo = $email;
	
	// we need to know how many slots are available
    $slotsInformation = getSlotsInformation();
    $remainingSlots = $slotsInformation["remainingSlots"];
	
	$enoughSlotsRemaining = $remainingSlots >= $slots;
	
	//if(!$production){
	//	echo "Remaining slots: ".$remainingSlots;
	//	echo "Requested slots: ".$slots;
	//	exit;
	//}
	
	if($enoughSlotsRemaining){
		// update validated: set true
		$sql = "UPDATE `foire_vetements` SET validated = 1 WHERE uuid = '$escapedUuid';";
		
		$result = null;
		if(!$result = $dbConnection->query($sql)){
        	throw new Exception("There was an error running the query. Error: ".$dbConnection->error);
        }
        
        // send the confirmation e-mail
    	$emailSubject = $emailConfiguration["templateSubjectConfirmation"];
    	$emailMessage = $emailConfiguration["templateMessageConfirmation"];
    
    	// now we update the mail message with the actual values
    	$emailMessage = str_replace("%%SLOTS%%", $slots, $emailMessage);
    	$emailMessage = str_replace("%%FIRSTNAME%%", $firstName, $emailMessage);
    	$emailMessage = str_replace("%%LASTNAME%%", $lastName, $emailMessage);
    	$emailMessage = str_replace("%%IDENTIFIANT%%", $uuid, $emailMessage);
		
    	// finally, we can send the mail
    	$emailSentSuccessfully = sendHTMLEmail($emailFromName, $emailFrom, $emailTo, $emailSubject, $emailMessage);
    
    	if(!$emailSentSuccessfully){
    		throw new Exception("There was an error sending the registration confirmation e-mail");
    	}
    
    	// the mail was sent successfully
		
		// preparing the final HTTP response (success)
		// will be used by the front-end to display the results
		$retVal = array(
			"uuid" => $uuid,
			"firstName" => $firstName,
			"lastName" => $lastName,
			"email" => $email,
			"city" => $city,
			"phone" => $phone,
			"slots" => $slots, // slots that the client requested
			"member" => $member,
			"memberNumber" => $memberNumber,
			"waitList" => $waitList,
			"result" => "succeeded"
		);
		
		$response = $response->withHeader('Content-type', 'application/json');
		$response->write(json_encode($retVal));
		
        return $response;
	}
	
	// there are not enough slots available, tough luck!
	
	// send the no slots left email
	$emailSubject = $emailConfiguration["templateSubjectFull"];
	$emailMessage = $emailConfiguration["templateMessageFull"];
	if($waitList) {
		$emailSubject = $emailConfiguration["templateSubjectFullOnWaitList"];
		$emailMessage = $emailConfiguration["templateMessageFullOnWaitList"];
	}

	// now we update the mail message with the actual values
	$emailMessage = str_replace("%%IDENTIFIANT%%", $uuid, $emailMessage);
    
	// finally, we can send the mail
	$emailSentSuccessfully = sendHTMLEmail($emailFromName, $emailFrom, $emailTo, $emailSubject, $emailMessage);
        
	if(!$emailSentSuccessfully){
		throw new Exception("There was an error sending the registration full e-mail");
	}

	// the mail was sent successfully
	
	// preparing the final HTTP response
	$response = $response->withStatus(409);
	$response = $response->withHeader('Content-type', 'application/json');
    $responseBodyNotEnoughSlotsAvailable = array('not_enough_slots_available_on_wait_list' => $slotsInformation["remainingSlots"]);
    $response->write(json_encode($responseBodyNotEnoughSlotsAvailable));
    
	return $response;
})->setName("register");

?>
