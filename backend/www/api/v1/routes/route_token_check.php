<?php

// reference: https://github.com/firebase/php-jwt
use Firebase\JWT\JWT;

// reference: https://github.com/ramsey/uuid
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\Exception\UnsatisfiedDependencyException;

$app->get('/token_check', function($request, $response) {
	// check that a JWT token has been provided
	if (!$request->hasHeader("Authorization")) {
        $response = $response->withStatus(401);
        return $response;
    }
    
    // get the Authorization header value & sanitize
    $authorizationHeaderValue = $request->getHeaderLine("Authorization");
    $sanitizedAuthorizationHeaderValue = strip_tags($authorizationHeaderValue);
    
    // if it does not start with bearer
    $bearerPrefix = "Bearer ";
    if(0 !== strpos($sanitizedAuthorizationHeaderValue, $bearerPrefix)){
    	$response = $response->withStatus(401);
    	return $response;
    }
    
    $jwt = str_replace($bearerPrefix, "", $sanitizedAuthorizationHeaderValue);
    
	// load token generation configuration
	// adapt the path depending on where the file is located
	$tokenConfiguration = parse_ini_file("../../../jwt-secrets.ini");
	
	// try to decode & validate if expired
	// php-jwt library references:
	// https://github.com/firebase/php-jwt
	// https://github.com/firebase/php-jwt/blob/master/tests/JWTTest.php
	try {
    	$decoded = JWT::decode($jwt, $tokenConfiguration["key"], array($tokenConfiguration["signatureAlgorithm"]));
    	$decoded_array = (array) $decoded;
    	
    	$response->write(json_encode($decoded));
    	
    	// check the claims
    	if($tokenConfiguration["audienceClaim"] !== $decoded_array["aud"]){
    		throw new Exception("The audience claim is invalid");
    	}
    	if($tokenConfiguration["issuerClaim"] !== $decoded_array["iss"]){
    		throw new Exception("The issuer claim is invalid");
    	}
    } catch (Exception $e) {
        $response = $response->withStatus(401);
        return $response;
    }
	
	return $response;
})->setName("token_check");

?>
