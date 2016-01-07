<?php

// reference: https://github.com/firebase/php-jwt
use Firebase\JWT\JWT;

// reference: https://github.com/ramsey/uuid
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\Exception\UnsatisfiedDependencyException;

$app->get('/token', function($request, $response) {
	// Get client's IP address
	$clientIP = $_SERVER['REMOTE_ADDR'];
	
	// Generate a version 4 (random) UUID object
	// We need a unique ID
	$uuid = Uuid::uuid4()->toString(); // i.e. 25769c6c-d34d-4bfe-ba98-e0ee856f3e7a
	
	// load token generation configuration
	// adapt the path depending on where the file is located
	$tokenConfiguration = parse_ini_file("../../../jwt-secrets.ini");
	
	// define token creation time
	$tokenCreationTime = time();
	
	// define token expiration time
	$tokenValidity = 30*60; // 30 minutes
	$tokenExpirationTime = time() + $tokenValidity;
	
	// generate JWT token
	// reference: https://self-issued.info/docs/draft-ietf-oauth-json-web-token.html
	$tokenClaims = array(
		// JWT ID: unique identifier for the JWT
		// protect against replay attacks
		"jti" => $uuid,
		
		// issuer
		"iss" => $tokenConfiguration["issuerClaim"],
		
		// audience
		"aud" => $tokenConfiguration["audienceClaim"],
		
		// issued at: time at which the JWT was issued
		"iat" => $tokenCreationTime,
		
		// not before: the time before which the JWT cannot be used
		"nbf" => $tokenCreationTime,
		
		// expiration
		// protect against replay attacks
		"exp" => $tokenExpirationTime,
		
		"clientIPAddress" => $clientIP
	);
	
	// php-jwt library references:
	// https://github.com/firebase/php-jwt
	// https://github.com/firebase/php-jwt/blob/master/tests/JWTTest.php
	$jwt = JWT::encode($tokenClaims, $tokenConfiguration["key"], $tokenConfiguration["signatureAlgorithm"]);

	// return generated token
	$retVal = array(
		"token" => $jwt,
		"expiresIn" => $tokenValidity // seconds
	);
	
	$response = $response->withHeader('Content-type', 'application/json');
	$response->write(json_encode($retVal));
	
	return $response;
})->setName("token");

?>
