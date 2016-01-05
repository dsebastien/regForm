// TODO implement or drop in favor of REST api

// check for the presence of the token, validity, IP, previous tries, etc
// decode
$decoded = JWT::decode($jwt, $tokenConfiguration["key"], array($tokenConfiguration["signatureAlgorithm"]));
//print_r($decoded);
$decoded_array = (array) $decoded;
print_r($decoded_array);
