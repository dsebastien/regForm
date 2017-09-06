<?php

// Database-dependent utilities

// Load DB configuration
// adapt the path depending on where the file is located
$dbConfiguration = parse_ini_file("../../../db-secrets.ini");
$dbConnection = null;

// Get a connection to the database
// If it can't be established, an exception is thrown
function getDatabaseConnection(){
	global $dbConfiguration;
	global $dbConnection;
	
	if($dbConnection === null){
		$dbConnection = new mysqli($dbConfiguration["host"], $dbConfiguration["username"], $dbConfiguration["password"], $dbConfiguration["name"]);
    	if($dbConnection->connect_error){
    		throw new Exception("Could not connect to the database. Error: ".$dbConnection->connect_error);
    	}
    	
    	if($dbConnection === null){
    		throw new Exception("Database connection not defined as expected!");
    	}
    }
    return $dbConnection;
}

// Releases the database connection if it is open
function ensureDatabaseConnectionIsClosed(){
	global $dbConnection;
	
	if($dbConnection !== null){
		try{
    		$dbConnection->close();
    	}catch(Exception $e){
    		// silence please (I know I know...)
    	}
    	$dbConnection = null;
    }
}

// Returns information about the slots (total, used, remaining)
function getSlotsInformation(){
	$dbConnection = getDatabaseConnection();
	
	// initialization
	$totalSlots = 0;
	$usedSlots = 0;
	$remainingSlots = 0;
	
	// get total slots
	$sql = "SELECT total_slots FROM `foire_vetements_meta`";
	
	$result = null;
	if(!$result = $dbConnection->query($sql)){
		throw new Exception("There was an error running the query. Error: ".$dbConnection->error);
	}
	
	while($row = $result->fetch_assoc()){
		$totalSlots = $row['total_slots'];
	}
	$result->free();
	
	// get used slots (i.e., slots reserved by people who have confirmed and are not on the wait list)
	$sql = "SELECT SUM(slots) as 'sum' FROM `foire_vetements` WHERE confirmed = 1 AND on_wait_list = 0 AND validated = 1";
	
	$result = null;
	if(!$result = $dbConnection->query($sql)){
		throw new Exception("There was an error running the query: ".$dbConnection->error);
	}
	
	while($row = $result->fetch_assoc()){
		$usedSlots = $row["sum"];
	}
	$result->free();
	
	// make sure that we define a value
	if($usedSlots === null || $usedSlots === ""){
		$usedSlots = 0;
	}
	
	// calculate the remaining slots
	$remainingSlots = $totalSlots - $usedSlots;

	// create the return object
	$retVal = array(
    	"totalSlots" => $totalSlots,
    	"usedSlots" => $usedSlots,
    	"remainingSlots" => $remainingSlots
    );
    
    return $retVal;
}

?>
