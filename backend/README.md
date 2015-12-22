# About
This readme contains information about the back-end part and how it works.

# Workflow
* user visits the page, gets the resources and the application starts in his browser
* the application requests a token from the back-end (token.php)
* the back-end generates a JWT, signs it and returns it (not encrypted as there is no sensible information in it)
* the application saves the token in localStorage
* the user fills-in the form & submits it
  * the application passes the token along with the request (Authorization: Bearer <token>
* the back-end
  * checks for the presence of the token, validity, IP, previous tries, etc (done by token_check.php)
    * if ok
      * validates the request
      * saves
      * confirms
      * returns 200 OK
    * if nok
      * 401 (no token) or 403 (invalid, outdated, different ip, ...)

# Back-end files
* token.php: generates JWT tokens
* token_check.php: verifies provided tokens

# Installation & Configuration

## Prereqs
The server MUST have PHP > 5.2, otherwise namespaces, interfaces, etc won't be supported.
For OVH, the .ovhconfig and .htaccess files can be copied to the root of the www folder.

## Files
Upload the token folder to your www root.

## Configuration
The back-end has (dirty little) secrets that it uses to sign & encrypt the tokens it generates. The secrets must NEVER be exposed through www.
Any client can request tokens through the back-end, but IP checks, rate limitations, etc will limit the exposure.

Copy the `jwt-secrets.ini` file to a safe location on your web host.
Adapt the path towards jwt-secrets.ini in:
* token.php
* token_check.php

# Security warning
Do NOT assume that any of this is SECURE. It is not the case. JWT are used only to play with the technology.
There is no authentication whatsoever thus anyone can request a token easily
JWTs are not immune to XSS (because tokens will be stored in localStorage).
Tokens cannot be revoked and HTTPS won't be implemented on the back-end, thus the whole system is subject to MITM and replay attacks (for the validity period of the tokens).
https://stormpath.com/blog/where-to-store-your-jwts-cookies-vs-html5-web-storage/
