<?php

// reference: https://github.com/firebase/php-jwt
use Firebase\JWT\JWT;

// reference: https://github.com/ramsey/uuid
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\Exception\UnsatisfiedDependencyException;

///////////////////////////////////////////////////////////////////
// FUNCTIONS
///////////////////////////////////////////////////////////////////
$httpHeaderPrefix = "HTTP_";
$authorizationHeaderName = "X_Authorization"; // modified because my Web host removes the default/standard "Authorization" header !
$authorizationHeader = $httpHeaderPrefix . $authorizationHeaderName;

// Ensures that the provided request contains a valid JWT token
// passed through the Authorization header in the form: X_Authorization Bearer <token>
function checkToken($request, $response){
	global $authorizationHeader; // let's go global (err crazy)

	// check that a JWT token has been provided
	if (!$request->hasHeader($authorizationHeader)) {
        $response = $response->withStatus(401);
        return $response;
    }
    
    // get the Authorization header value & sanitize
    $authorizationHeaderValue = $request->getHeaderLine($authorizationHeader);
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
    	
    	// check the claims
    	if($tokenConfiguration["audienceClaim"] !== $decoded_array["aud"]){
    		throw new Exception("The audience claim is invalid");
    	}
    	if($tokenConfiguration["issuerClaim"] !== $decoded_array["iss"]){
    		throw new Exception("The issuer claim is invalid");
    	}
    } catch (Exception $e) {
        $response = $response->withStatus(403);
        return $response;
    }
    
    return $response; // left untouched in this case
}


// send confirmation mail
// OVH mailing reference: http://a-pellegrini.developpez.com/tutoriels/php/mail/
/*
$fromName = "John Doe";
$from = "Jane@doe.com";
$to = "whoeveriwant@noop";
$subject = "Hello";
$message = "World";

$headers  = "MIME-Version: 1.0 \n";
$headers .= "Content-type: text/plain; charset=utf-8 \n"; // text/html; charset=utf-8
$headers .= "From: ".$fromName." <".$from."> \n";
//$headers .= "Reply-To: ".$sender." \n";
$headers .= "Priority: normal \n"; // urgent; non-urgent
$headers .= "\n";

$result = @mail ($to, $subject, $message, $headers);
if ($CR_Mail === FALSE){
	echo "Failed to send"; // todo
}else{
	echo "Sent";
}
*/

?>
