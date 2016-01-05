# About
This readme contains information about the back-end part and how it works.

# Flows

## Basic registration flow

### Token generation
* user visits the page, gets the resources and the application starts in his browser
* the application requests a token from the back-end (token.php)
* the back-end generates a JWT, signs it and returns it (not encrypted as there is no sensible information in it)
* the application saves the token in localStorage

### Registration
* the user fills-in the form
  * provide user details
  * choose number of slots
  * choose if he wants to be on wait list if no slots remaining  
* the user submits the form
  * use the API to check if remaining slots
    * if not, warning + user confirm
  * the application passes the token along when it sends requests: Authorization: Bearer <token>
* when the back-end receives a subscription request
  * it checks for the presence of the token, validity, IP, previous tries, etc (done by token_check.php)
    * if ok
      * validates the request
        * check maximum number of slots
        * validates user input
      * determine if enough slots remaining
      
      * saves
        * if no free slots available & user wishes to be on wait list: add to the wait list
        * if free slots available then OK
      * confirms (mail to the requester)
        * if on wait list, specific mail
        * if slots ok, specific mail
      * returns 200 OK
    * if nok
      * 401 (no token) or 403 (invalid, outdated, different ip, ...)


People can always register:
* the user can choose to be on wait list (checkbox)
  * if on wait list, no confirmation mail is required

When people update their registration or cancel it:
* check wait list
  * are there members waiting?
    * if so, can they fill exactly the number of now free slots?
      * if so, remove them from the wait list, send a confirmation mail
  * if members couldn't fill the free slots, check other people on the wait list

Detail back-end API


provide a back-end page (requiring authentication) to get a list of all registrations and their status
* if admin token found: display registrations
* if no token found: login form: provide username/password
* if ok, generate admin token and refresh








## Emails
### Reservation confirmation
* goal: ensure correct e-mail/person
* contains
  * details about the reservation (if slots still available) or wait list
  * a link that the user must click on to confirm his registration
    * link to api call with
      * ?uuid=<user_uuid>
      * &action=confirm_registration
* confirmed stays false in DB until link clicked upon

### Wait list pick
* goal: let the user know that his registration is now complete
* contains
  * details about the reservation

### Reservation update confirmation
* goal: confirmation to the user that his registration was successfully updated
* contains
  * details about the reservation

### Registration cancellation confirmation
* goal: let the user confirm that he wishes to cancel his registration

### Registration cancelled
* goal: let the user know that his registration has now been cancelled


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
