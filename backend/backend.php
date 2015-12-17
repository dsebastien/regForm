<?php
// check JWT presence
// validate JWT

// check input parameters presence
// validate input

// save input

// send confirmation mail
// OVH mailing reference: http://a-pellegrini.developpez.com/tutoriels/php/mail/
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

?>