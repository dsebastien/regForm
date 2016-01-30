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
	
	$dbConnection = getDatabaseConnection();
	
	// received a valid UUID
	// check the database to see if it is known
	$escapedUuid = $dbConnection->real_escape_string($uuid);
	
	$dbConnection = getDatabaseConnection();
	
	$registrationExists = false;
	$registrationAlreadyConfirmed = false;
	$requestedSlots = 0;
	$email = "";
	$firstname = "";
	$lastname = "";
	
	$sql = "SELECT confirmed, slots, email, first_name, last_name FROM `foire_vetements` WHERE uuid = '$escapedUuid'";
	
	$result = null;
	if(!$result = $dbConnection->query($sql)){
		throw new Exception("There was an error running the query. Error: ".$dbConnection->error);
	}
	
	while($row = $result->fetch_assoc()){
		$registrationExists = true;
		$registrationAlreadyConfirmed = $row["confirmed"];
		$requestedSlots = $row["slots"];
		$email = $row["email"];
		$firstname = $row["first_name"];
		$lastname = $row["last_name"];
	}
	$result->free();
    	
	if(!$registrationExists){
		$response = $response->withStatus(400);
        return $response;
	}
	
	$baseURL = getBaseURL();
    $registrationConfirmedURL = $baseURL . "/liguefamjurbise/#/registrationConfirmation";
    $registrationFullURL = $baseURL . "/liguefamjurbise/#/registrationFull";
	
	if($registrationAlreadyConfirmed){
		// redirect to the registration confirmed page
		$response = $response->withHeader('Location', $registrationConfirmedURL);
		$response = $response->withStatus(302); // found
		return $response;
	}
	
	// registration exists and was not yet confirmed
	
	// OK so far so we can mark is as confirmed
	$sql = "UPDATE `foire_vetements` SET confirmed = 1 WHERE uuid = '$escapedUuid';";
	$result = null;
	if(!$result = $dbConnection->query($sql)){
		throw new Exception("There was an error running the query. Error: ".$dbConnection->error);
	}
	
	// load mail configuration
    // adapt the path depending on where the file is located
    $emailConfiguration = parse_ini_file("../mail-configuration.ini");
    
    $emailFrom = $emailConfiguration["from"];
    $emailFromName = $emailConfiguration["fromName"];
    $emailTo = $email;
	
	// we need to know how many slots are available
    $slots = getSlotsInformation();
    $remainingSlots = $slots["remainingSlots"];
	
	$enoughSlotsRemaining = $remainingSlots >= $requestedSlots;
	
	if($enoughSlotsRemaining){
		// update confirm: set true
		// update wait list: set false
		$sql = "UPDATE `foire_vetements` SET on_wait_list = 0 WHERE uuid = '$escapedUuid';";
		
		$result = null;
		if(!$result = $dbConnection->query($sql)){
        	throw new Exception("There was an error running the query. Error: ".$dbConnection->error);
        }
        
        // send the confirmation e-mail
    	$emailSubject = $emailConfiguration["templateSubjectConfirmation"];
    	$emailMessage = $emailConfiguration["templateMessageConfirmation"];
    
    	// now we update the mail message with the actual values
    	$emailMessage = str_replace("%%SLOTS%%", $requestedSlots, $emailMessage);
    	$emailMessage = str_replace("%%FIRSTNAME%%", $firstname, $emailMessage);
    	$emailMessage = str_replace("%%LASTNAME%%", $lastname, $emailMessage);
    	$emailMessage = str_replace("%%IDENTIFIANT%%", $uuid, $emailMessage);

    	// finally, we can send the mail
    	$emailSentSuccessfully = sendHTMLEmail($emailFromName, $emailFrom, $emailTo, $emailSubject, $emailMessage);
    
    	if(!$emailSentSuccessfully){
    		throw new Exception("There was an error sending the registration confirmation e-mail");
    	}
    
    	// the mail was sent successfully
		// redirect to the registration confirmed page
        $response = $response->withHeader('Location', $registrationConfirmedURL);
        $response = $response->withStatus(302); // found
        return $response;
	}
	
	// there are not enough slots available, tough luck!
	
	// send the no slots left email
	$emailSubject = $emailConfiguration["templateSubjectFull"];
    $emailMessage = $emailConfiguration["templateMessageFull"];

	// now we update the mail message with the actual values
	$emailMessage = str_replace("%%IDENTIFIANT%%", $uuid, $emailMessage);
    
	// finally, we can send the mail
	$emailSentSuccessfully = sendHTMLEmail($emailFromName, $emailFrom, $emailTo, $emailSubject, $emailMessage);
        
	if(!$emailSentSuccessfully){
		throw new Exception("There was an error sending the registration full e-mail");
	}

	// the mail was sent successfully
	// redirect to the registration confirmed page
	$response = $response->withHeader('Location', $registrationFullURL);
	$response = $response->withStatus(302); // found

	return $response;
})->setName("confirm_registration");

?>
