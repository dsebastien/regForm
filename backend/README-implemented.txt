# About
This readme contains information about the back-end part and how it works.

# Back-end API

## About
The back-end API is the layer between the application and the database and is written in PHP.
Note that authenticated API requests are authorized if a valid JWT token is provided.
My goal with this is just to start playing around with JWTs (generation/signature/validation), see the warning about security at the end

## Security warning
Do NOT assume that any of this is SECURE. It is not the case. JWT are used only to play with the technology.
There is no authentication whatsoever thus anyone can request a token easily
JWTs are not immune to XSS (because tokens will be stored in localStorage).
Tokens cannot be revoked and HTTPS won't be implemented on the back-end, thus the whole system is subject to MITM and replay attacks (for the validity period of the tokens).
https://stormpath.com/blog/where-to-store-your-jwts-cookies-vs-html5-web-storage/

## API

### About
Here you find information about the API and how to interact with it, not the inner details; for that check the specifications below.

### Implemented
/api/v1

* /token GET (implemented)
  * public
  * generate JSON Web Tokens (JWT)
  * Responses
    * 200 OK with a response body of the following form:
      ```
		{
           "token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJqdGkiOiJiYTY1ZTk0Yy0zNmNlLTQ2OGUtODhlMC03NGI1MTQ3ZjUyNTAiLCJpc3MiOiJodHRwOlwvXC93d3cuZHVib2lzaHViZXJ0LmJlIiwiYXVkIjoiaHR0cDpcL1wvd3d3LmR1Ym9pc2h1YmVydC5iZSIsImlhdCI6MTQ1MDc4MTY5MCwibmJmIjoxNDUwNzgxNjkwLCJleHAiOjE0NTA3ODM0OTAsImNsaWVudElQQWRkcmVzcyI6IjEwOS4xMjkuMjIuNDYifQ.x3k4txdDO14TKFUGphbXF7BfIsuGc3w_v6iGdWzOS1p4coQK2JKGrCdat6Ywz1UsPNFa-w6G6ioERbWCj-stKg",
           "expiresIn":1800
        }
      ```
* /token/check GET (implemented)
  * Required HTTP Header: `X_Authorization: Bearer <token>`
  * Responses
    * 200 OK: token valid
    * error
      * 401 Unauthorized (credentials rejected)
        * if header not defined
        * if header not correctly defined
      * 403 Forbidden
        * if provided token invalid or expired
* /slots GET (implemented)
  * public
  * get information about slots (total available, reserved, remaining)
  * Responses
    * 200 OK with a response body in the following form:
      ```
      	{
      		"totalSlots":"100",
      		"usedSlots":0,
      		"remainingSlots":100
      	}
      ```




# Specifications

## Token generation (/token) (implemented)

Steps:
* user visits the page, gets the resources and the application starts in his browser
* the application checks localStorage to see if a token is already present
* if there is a token and it is still valid, no new token is requested
* if there is no token or if the saved one is invalid/expired, the application requests a token from the back-end (token.php)
  * the back-end generates a JWT, signs it and returns it (not encrypted as there is no sensible information in it)
  * the application saves the token in localStorage

## Remaining slots display (implemented)
Pre-requisites:
* the application has requested & received a token

Steps:
* the application requests the number of remaining slots (API call)
* the back-end checks the presence and validity of the token before accepting the request
  * if the token is not present or invalid, return 403
* the back-end calculates the remaining slots:
  * total = `total_slots` (`foire_vetements_meta`)
  * used = SUM(slots) FROM `foire_vetements` WHERE confirmed = 1 AND on_wait_list = 0
  * remaining = total - used slots
* the back-end returns information about the slots
* the application displays the information
  * remaining slots over total slots
  * displays a warning if <= 10% of slots remaining








# Installation & Configuration

## Prereqs
The server MUST have PHP > 5.2, otherwise namespaces, interfaces, etc won't be supported.
For OVH, the .ovhconfig and .htaccess files can be copied to the root of the www folder.

## Database
You need to execute the provided DDL (see ddl.sql) so that the required tables are available to the application.

## Files
Upload the contents of the back-end folder to your www root.

## Configuration
The back-end has (dirty little) secrets that it uses to sign & encrypt the tokens it generates. The secrets must NEVER be exposed through www.
Any client can request tokens through the back-end, but IP checks, rate limitations, etc will limit the exposure.

Copy the `jwt-secrets.ini` file to a safe location on your web host.
Adapt the path towards jwt-secrets.ini in index.php (api/v1)

# Dependencies
The back-end API depends on multiple 3rd party PHP libraries. Those are listed in the `composer.json` configuration file.

If modifications are needed in the dependencies (e.g., version update) then [composer](https://getcomposer.org/) must be used:
* make any modifications needed to the composer.json file (never modify the contents of the 'vendor' folder)
* execute `composer install` or `composer update`

If new dependencies are needed, just run `composer require`...

And RTFM :)
