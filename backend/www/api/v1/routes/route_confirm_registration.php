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
	
	// TODO implement
	
	return $response;
})->setName("confirm_registration");

?>
