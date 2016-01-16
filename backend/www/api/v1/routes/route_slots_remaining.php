<?php

$app->get('/slots', function($request, $response) {
	// This returns information about the total, used and remaining slots
	
	// load DB configuration
	// adapt the path depending on where the file is located
	$dbConfiguration = parse_ini_file("../../../db-secrets.ini");
	// $dbConfiguration["charset"];
	$dbConnection = new mysqli($dbConfiguration["host"], $dbConfiguration["username"], $dbConfiguration["password"], $dbConfiguration["name"]);
    if($dbConnection->connect_error){
    	throw new Exception("Could not connect to the database. Error: ".$dbConnection->connect_error);
    }
	
	// initialization
	$totalSlots = 0;
	$usedSlots = 0;
	$remainingSlots = 0;
	
	// get total slots
	$sql = 'SELECT total_slots FROM `foire_vetements_meta`';
	
	$result = null;
	if(!$result = $dbConnection->query($sql)){
		throw new Exception("There was an error running the query. Error: ".$dbConnection->error);
    }
    
	while($row = $result->fetch_assoc()){
        $totalSlots = $row['total_slots'];
    }
    $result->free();
	
	// get used slots (i.e., slots reserved by people who have confirmed and are not on the wait list)
	$sql = 'SELECT SUM(slots) FROM `foire_vetements` WHERE confirmed = 1 AND on_wait_list = 0';
	
	$result = null;
	if(!$result = $dbConnection->query($sql)){
		throw new Exception("There was an error running the query: ".$dbConnection->error);
	}
	
	while($row = $result->fetch_assoc()){
    	$usedSlots = $row[0];
    }
	$result->free();
	
	// close the connection
	$dbConnection->close();
	
	// make sure that we define a value
	if($usedSlots == ""){
    	$usedSlots = 0;
    }
    
    // calculate the remaining slots
    $remainingSlots = $totalSlots - $usedSlots;
    
    // prepare response
    $retVal = array(
    	"totalSlots" => $totalSlots,
    	"usedSlots" => $usedSlots,
    	"remainingSlots" => $remainingSlots
    );
	
	$response = $response->withHeader('Content-type', 'application/json');
	$response->write(json_encode($retVal));
	
	return $response;
})->setName("slots");

?>
