# About
This readme contains information about the back-end part and how it works.

# Back-end API
* /api/v1
  * /slots GET
    * get information about slots (total available, reserved, remaining)
  * /register POST
    * POST: registration information
      * Required HTTP Header: `Authorization: Bearer <token>`
      * Required parameters 
        * firstname
        * lastname
        * email
        * phone
        * slots [1-4]
        * member
        * waitList
          * if the user wants to be on the wait list in case there are no slots left
      * requests user confirmation (mail)
      * Responses:
        * confirmation mail sent
        * error
          * invalid input
          * mail already registered
  * /confirm_registration GET
    * Required parameters
      * uuid: user's uuid

# Specifications

## Token generation

Steps:
* user visits the page, gets the resources and the application starts in his browser
* the application requests a token from the back-end (token.php)
* the back-end generates a JWT, signs it and returns it (not encrypted as there is no sensible information in it)
* the application saves the token in localStorage

## Remaining slots display
Pre-requisites:
* the application has requested & received a token

Steps:
* the application requests the number of remaining slots (API call)
* the application displays the information

## Basic registration flow
Pre-requisites:
* the application has requested & received a token

Steps:
The user fills-in the form
* provide details (firstname, lastname, ...)
* choose number of slots  

The user submits the form
* the application checks if there are enough remaining slots (API call)
  * if not, the application warns the user
    * if the user has chosen to be added to the waiting list
      * the request is sent
    * if the user has chosen not to be added to the waiting list
      * an information message is displayed: "no slots available but you can request to be added to the wait list"
  * if yes, the request is sent
* the application passes the token along when it sends requests: Authorization: Bearer <token>

When the back-end receives a subscription request
* it checks for the presence of the token, validity, IP, previous tries, etc (done by token_check.php)
  * if nok
    * 401: no token
    * 403: unauthorized (invalid, outdate, different ip, ...)
* it validates the provided input
  * all information provided
  * slots is in the valid range
  * data format is ok (e.g., mail, phone)
  * if validation error, return error
    * check maximum number of slots
    * validates user input
  * checks remaining slots
    * if requested > available
      * if user wishes to be on wait list, continue
      * if user does not wish to be on wait list, return error
  * generates UUID for registration
  * saves registration details in database
    * confirmed == false at this point in DB
    * if error
      * return 5xy
  * sends confirmation mail to the requester
    * see Registration confirmation mail section
  * returns 200 OK with registration id and registration details

Once the application receives the response
  * it first checks the response code
    * 4xx or 5xx: display generic error page
    * 200: redirect to confirmation page with all registration details (give the id)
  * if confirmation page
    * display registration details
    * explain that they should check their mail

Once the user clicks on the registration confirmation mail
  * validates the provided parameters
  * encodes the provided parameters
  * checks if a registration with that uuid exists
    * if not, return 4xx
  * if it exists
    * if it is already confirmed: do nothing
    * update the 'confirmed' field (set to true)
  * if error
    * redirect to application error page
  * redirect to confirmation success page w/ registration details

Once the application gets to the confirmation success page the registration details are displayed again

## Emails
### Registration confirmation request
* goal: ensure correct e-mail/person
* contains
  * details about the reservation (firstname, lastname, mail, phone, slots reserved, ...)
  * different message whether on wait list or not
  * a link that the user must click on to confirm his registration
    * link to /confirm_registration API call

# Back-end files
* token.php: generates JWT tokens
* token_check.php: verifies provided tokens

# Installation & Configuration

## Prereqs
The server MUST have PHP > 5.2, otherwise namespaces, interfaces, etc won't be supported.
For OVH, the .ovhconfig and .htaccess files can be copied to the root of the www folder.

## Database
You need to execute the provided DDL (see ddl.sql) so that the required tables are available to the application.

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
