// decode
$decoded = JWT::decode($jwt, $tokenConfiguration["key"], array($tokenConfiguration["signatureAlgorithm"]));
//print_r($decoded);
$decoded_array = (array) $decoded;
print_r($decoded_array);
