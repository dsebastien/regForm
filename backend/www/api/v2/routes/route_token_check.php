<?php

$app->get('/token_check', function($request, $response) {
	return checkToken($request, $response); // in this case we only need to check the token's presence & validity
})->setName("token_check");

?>
