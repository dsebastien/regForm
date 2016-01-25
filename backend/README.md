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


## Registration form
Pre-requisites:
* the application has requested & received a token

Steps:
The user fills-in the form
* provide details (firstname, lastname, ...)
* choose number of slots



TODO continue here

* if there is less than 20% of the slots available, the user can choose to be added to the wait list


The user submits the form
* the application checks if there are enough remaining slots (API call)
  * if not, the application warns the user
    * if the user has chosen to be added to the waiting list
      * the request is sent
    * if the user has chosen not to be added to the waiting list
      * an information message is displayed: "no slots available but you can request to be added to the wait list"
  * if yes, the request is sent as JSON
* the application passes the token along when it sends requests: X_Authorization: Bearer <token>

Example requests:

A non-member wishes does not wish to be on the wait list:
```
{
	"firstName": "...",
	"lastName": "...",
	"email": "...",
	"phone": "...",
	"slots": 2,
	"member": false,
	"waitList": false
}
```

A non-member wished to be on the wait list:
```
{
	"firstName": "...",
	"lastName": "...",
	"email": "...",
	"phone": "...",
	"slots": 2,
	"member": false,
	"waitList": true
}
```

## Registration form submission result front-end display
Pre-requisites:
* the back-end has provided a response to the registration request

Steps:
Once the application receives the response
  * it first checks the response code
    * 4xx or 5xx: display generic error page
    * 200: redirect to confirmation page with all registration details (give the id)
  * if confirmation page
    * display registration details
    * explain that they should check their mailbox


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
