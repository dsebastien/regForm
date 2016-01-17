<?php

$app->get('/confirm_registration/{uuid}', function($request, $response, $args) {
	$uuid = $args["uuid"];
	$response->write("Provided UUID: $uuid");
	
	// TODO implement
	
	
	return $response;
})->setName("confirm_registration");

?>
