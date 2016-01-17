<?php

// General purpose utilities

// reference: https://github.com/firebase/php-jwt
use Firebase\JWT\JWT;

// reference: https://github.com/ramsey/uuid
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\Exception\UnsatisfiedDependencyException;

///////////////////////////////////////////////////////////////////
// Configuration
///////////////////////////////////////////////////////////////////

// HTTP headers require special treatment with OVH
$httpHeaderPrefix = "HTTP_";
$authorizationHeaderName = "X_Authorization"; // modified because my Web host removes the default/standard "Authorization" header !
$authorizationHeader = $httpHeaderPrefix . $authorizationHeaderName;

///////////////////////////////////////////////////////////////////
// FUNCTIONS
///////////////////////////////////////////////////////////////////

// Generates a version 4 (random) UUID object
function generateUUID(){
	return Uuid::uuid4()->toString(); // i.e. 25769c6c-d34d-4bfe-ba98-e0ee856f3e7a
}

// Returns the current client's IP address
function getClientIP(){
	return $_SERVER['REMOTE_ADDR'];
}

// converts a boolean to an int
function convertBooleanToInt($value){
	if($value === null || !is_bool($value)){
		throw new Exception("The provided value is not a boolean!");
	}
	return $value? 1 : 0;
}


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
    	
    	// validate that the client IP stored in the token is the same as the current client IP
    	$currentClientIP = getClientIP();
    	if($decoded_array["clientIPAddress"] !== $currentClientIP){
    		throw new Exception("The current client IP is not the same as the original client IP that requested the token");
    	}
    } catch (Exception $e) {
        $response = $response->withStatus(403);
        return $response;
    }
    
    return $response; // left untouched in this case
}

// Throws an exception if the provided key does not exist in the given array
function ensureThatKeyExists($key, $array){
	if(!array_key_exists($key, $array)){
		throw new Exception("Missing key: " .$key);
	}
}

// Throws an exception if the provided value is undefined, null or empty
// Returns a trimmed version of the given value
function ensureNotEmpty($value){
	if($value === null || trim($value) === ""){
		throw new Exception("Unset, null or empty value: " .$value);
	}
	return trim($value);
}

// Throws an exception if the provided value is not an email
function ensureIsEmail($value){
	$isValidEmail = filter_var($value, FILTER_VALIDATE_EMAIL);
	if(!$isValidEmail){
		throw new Exception("The value is not a valid e-mail: ".$value);
	}
    return $value;
}

function ensureIsUUID($value){
	if($value === null || trim($value) === ""){
		throw new Exception("The value is null or empty!");
	}
	
	$trimmedValue = trim($value);
	$uuidInstance = null;
	try{
		$uuidInstance = Uuid::fromString($trimmedValue);
	}catch(Exception $e){
		throw new Exception("Failed to convert the value to a UUID: ".$value);
	}
	if($uuidInstance === null || $uuidInstance->toString() !== $trimmedValue){
		throw new Exception("The provided value is not a valid uuid: ".$value);
	}
	
	return $trimmedValue;
}

// Sends an e-mail (text or html) using the provided information
// Specific implementation for OVH
// PHP mailing reference: http://a-pellegrini.developpez.com/tutoriels/php/mail/
// if unavailable, reference in 'docs' folder
// The provided "format" argument MUST either be "html" or "plain" (i.e., text); if not provided or null, it defaults to "plain"
function sendEmail($fromName, $from, $to, $subject, $message, $format){
	$retVal = true; // it's important to be optimistic in life
	
	if($format === null){
		$format = "plain";
	}
	$format = strtolower($format); // avoid case surprises
	
	if(!$format === "plain" && !$format === "html"){
		throw new Exception("The format MUST be either html or text");
	}
	
	$headers  = "MIME-Version: 1.0 \n";
	$headers .= "Content-type: text/".$format."; charset=utf-8 \n"; // text/html; charset=utf-8
	$headers .= "From: ".$fromName." <".$from."> \n";
	//$headers .= "Reply-To: ".$sender." \n";
	$headers .= "Priority: normal \n"; // urgent; non-urgent
	$headers .= "\n";
	$result = @mail ($to, $subject, $message, $headers);
	
	if ($CR_Mail === FALSE){
		$retVal = false; // failed to send
    }
    
    return $retVal;
}

// Helper methods for sending emails
function sendHTMLEmail($fromName, $from, $to, $subject, $message){
	return sendEmail($fromName, $from, $to, $subject, $message, "html");
}

function sendTextEmail($fromName, $from, $to, $subject, $message){
	return sendEmail($fromName, $from, $to, $subject, $message, "plain");
}


// Determine if served over HTTP or HTTPS
// reference: http://stackoverflow.com/questions/17201170/php-how-to-get-the-base-domain-url
function getProtocol(){
	$protocol = "http";
	if(isset($_SERVER["HTTPS"])){
        $protocol = ($_SERVER["HTTPS"] && $_SERVER["HTTPS"] != "off") ? "https" : "http";
    }
    return $protocol;
}

// Return the base URL
function getBaseURL(){
	return getProtocol() . "://" . $_SERVER['SERVER_NAME'];
}

?>
