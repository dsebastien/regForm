# Yet to be implemented

* /email_check GET
  * Required parameters
    * Required HTTP Header: `X_Authorization: Bearer <token>`
    * Required payload: JSON containing
      ```
      {
      	"email": "..."
      }
      ```
    * Responses
      * error
        * 409: email already registered, with a response body in the following form:
  		  ```
  		  {
  			  "email_already_registered": "..."
  		  }
  		  ```
      * 200 OK: email not registered yet, with a response body in the following form:
  		  ```
  		  {
  			  "email_unknown": "..."
  		  }
  		  ```

* registration update
* registration cancellation

# Specifications

## E-mail available (/email_check)
Steps:

* the application send a GET request towards the email_check endpoint
  * the application provides a basic JSON payload:
    ```
	{
    	"email": "..."
    }
    ```
* the back-end checks the presence and validity of the token before accepting the request
  * if the token is not present or invalid, return 403
* the back-end checks the provided input
  * ensures that the input is valid JSON
  * ensures that the email parameter has been specified
  * ensures that the email parameter is not empty
  * ensures that the email parameter is an email
* if the validation fails, return 400
* the back-end sanitizes the input
* the back-end checks in the database to see if the email is already registered
* if the email is already in the database, return 409 (Conflict) with a response body in the following form:
  ```
  {
  	"email_already_registered": "..."
  }
  ```
* if the email is not yet in the database, return 200 (OK) with a response body in the following form:
  ```
  {
  	"email_unknown": "..."
  }
  ```
