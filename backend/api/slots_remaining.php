<?php
	// This returns information about the total, used and remaining slots
	
	// load DB configuration
	// adapt the path depending on where the file is located
	$dbConfiguration = parse_ini_file("../../db-secrets.ini");
	
	//echo "charset: " . $dbConfiguration["charset"];
	
	$dbConnection = new mysqli($dbConfiguration["host"], $dbConfiguration["username"], $dbConfiguration["password"], $dbConfiguration["name"]);
	
	if($dbConnection->connect_error){
		die("Could not connect to the database"); //  $db->connect_error
	}
	
	// initialization
	$totalSlots = 0;
	$usedSlots = 0;
	$remainingSlots = 0;
	
	
	// get total slots
	$sql = 'SELECT total_slots FROM `foire_vetements_meta`';
	
	if(!$result = $dbConnection->query($sql)){
        die('There was an error running the query'); // $db->error
    }
    
	while($row = $result->fetch_assoc()){
        $totalSlots = $row['total_slots'];
    }
    $result->free();
	
	
	// get used slots 
	$sql = 'SELECT SUM(slots) FROM `foire_vetements`';
	
	if(!$result = $dbConnection->query($sql)){
		die('There was an error running the query'); // $db->error
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
    	
    header('Content-Type: application/json');
    echo json_encode($retVal);
?>
