<?php

// Use that if you're not sure which version of PHP is active :)
//echo phpversion();

// Easily load dependencies through composer's autoload script
require "vendor/autoload.php";

// Load utils
require "api_utils.php";
require "api_utils_database.php";

// toggle for production
$production = true;

///////////////////////////////////////////////////////////////////
// REST API
///////////////////////////////////////////////////////////////////
$app = new \Slim\App();

// Configure debug mode (disable if in production)
$app->config("debug", !$production);

// Configure our own error handler
// No error output if in production
$appContainer = $app->getContainer();
if($production){
	$appContainer["errorHandler"] = function ($appContainer) {
    	return function ($request, $response, $exception) use ($appContainer) {
        	return $appContainer["response"]
        		->withStatus(500)
        		->withHeader("Content-Type", "text/plain")
        		->write("d[O_o]D");
    	};
	};
}else{
	$appContainer["errorHandler"] = function ($appContainer) {
    	return function ($request, $response, $exception) use ($appContainer) {
        	return $appContainer["response"]
        		->withStatus(500)
        		->withHeader("Content-Type", "text/plain")
        		->write($exception);
    	};
	};
}

///////////////////////////////////////////////////////////////////
// REST API Routes
///////////////////////////////////////////////////////////////////
$app->get('/', function($request, $response) {
	$response->write("Foire aux vetements API");
	return $response;
})->setName("home");

// Load all routes
foreach(glob("routes/*.php") as $routeFile){
    require $routeFile;
}

$app->run();

ensureDatabaseConnectionIsClosed(); // make sure that any opened database connection is closed

?>
