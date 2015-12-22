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

## Prereqs
The server MUST have PHP > 5.2, otherwise namespaces, interfaces, etc won't be supported.
For OVH, the .ovhconfig and .htaccess files can be copied to the root of the www folder.

## Files
Upload the token folder to your www root.

## Configuration
...

## Secrets
The back-end has (dirty little) secrets that it uses to sign & encrypt the tokens it generates. The secrets must NEVER be exposed through www.
Any client can request tokens through the back-end, but IP checks, rate limitations, etc will limit the exposure.

Copy the `jwt-secrets.ini` file to a safe location on your web host.
Once token.php has been upload, adapt the path towards jwt-secrets.ini.
