# About
...

# Workflow
* user visits, gets the resources and the application starts in his browser
* the application requests a token from the back-end
* the back-end generates a JWT, signs it then encrypts it
* the user fills-in the form & submits it
  * the token is passed along
* the back-end
  * checks for the presence of the token, validity, IP, previous tries, etc
    * if ok
      * validates the request
      * saves
      * confirms
      * returns 200 OK
    * if nok
      * 401 (no token) or 403 (invalid, outdated, different ip, ...)

# Installation & Configuration

## Files
...

## Configuration
...

## Secrets
The back-end has (dirty little) secrets that it uses to sign & encrypt. The secrets are not exposed through www.
Any client can request tokens through the back-end, but IP checks, rate limitations, etc will limit the exposure.

`jwt-secrets.ini`
