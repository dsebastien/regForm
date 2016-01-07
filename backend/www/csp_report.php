<?php

http_response_code(204);

// Get the raw POST data
$data = file_get_contents('php://input');

// Only continue if it is valid JSON that is not just `null`, `0`, `false` or an
// empty string, i.e. if it could be a CSP violation report.
if ($data = json_decode($data)) {
  // Prettify the JSON-formatted data
  $data = json_encode(
    $data,
    JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
  );
}

// write CSP violations to file
$cspViolationsFile = fopen("csp_violations.txt", "a");
fwrite($cspViolationsFile, $data);
fwrite($cspViolationsFile, "\r\n");
fclose($cspViolationsFile);
?>