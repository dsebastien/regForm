<?php

$app->get('/slots', function($request, $response) {
	// This returns information about the total, used and remaining slots
	
	// Get the slots information
	$retVal = getSlotsInformation();
	
	// Return it
	$response = $response->withHeader('Content-type', 'application/json');
	$response->write(json_encode($retVal));
	
	return $response;
})->setName("slots");

?>
