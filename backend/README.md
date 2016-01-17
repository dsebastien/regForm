* /register POST
  * POST: registration information
    * Required HTTP Header: `X_Authorization: Bearer <token>`
    * Required payload: JSON containing
      ```
        {
        	"firstName": "...",
        	"lastName": "...",
        	"email": "...",
        	"phone": "...",
        	"slots": x,
        	"member": false|true,
        	"waitList": false|true
        }
      ```
    * Checks if there is already a registration for the same email
      * if so, mail already registered error
    * requests user confirmation (mail)
    * Responses:
      * 200 OK: confirmation mail sent
      * error
        * 401: unauthorized (no token)
		* 403: forbidden (token, invalid, outdated, ...)
        * 400: bad request (invalid input)
        * 409: mail already registered. Body of the response:
           ```
           {
            "email_already_registered": "<email>"
           }
           ```
        * 409: not enough slots available. Body of the response:
          ```
          {
          	"not_enough_slots_available": "<remaining_slots>"
          }
          ```
* /confirm_registration GET
  * Required parameters
    * uuid: user's uuid
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

## Registration flow
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
  * if yes, the request is sent as JSON
* the application passes the token along when it sends requests: X_Authorization: Bearer <token>

Example requests:

A non-member wishes does not wish to be on the wait list:
```
{
	"firstName": "Sebastien",
	"lastName": "D",
	"email": "seb@dsebastien.net",
	"phone": "3247123",
	"slots": 2,
	"member": false,
	"waitList": false
}
```

A non-member wished to be on the wait list:
```
{
	"firstName": "Sebastien",
	"lastName": "D",
	"email": "seb@dsebastien.net",
	"phone": "3247123",
	"slots": 2,
	"member": false,
	"waitList": true
}
```

When the back-end receives a subscription request (register call)
* it checks for the presence of the token, validity, IP match
  * if nok
    * 401: no token
    * 403: unauthorized (token invalid, outdated, ...)
* it validates the provided input
  * all information provided
  * slots is in the valid range
  * data format is ok (e.g., mail, phone)
  * if validation error, return error 400
    * check maximum number of slots
    * validates user input
* checks if the email is not already in the database
  * if so, return error 409. Body of the response:
    ```
    {
       	"email_already_registered": "..."
	}
	```
* checks remaining slots
  * if requested > available
    * if user does not wish to be on wait list, return error
	  * 409: not enough slots available. Body of the response:
        ```
		{
        	"not_enough_slots_available": "<remaining_slots>"
        }
		```
* generates UUID for registration
* saves registration details in database
  * confirmed == false at this point in DB
  * if error
    * return 500


TODO

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
    * update the 'on_wait_list' field (set to false)
  * if error
    * redirect to application error page
  * redirect to confirmation success page w/ registration details

Once the application gets to the confirmation success page the registration details are displayed again


## eMail available (/email_check)
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

## Emails
### Registration confirmation request
* goal: ensure correct e-mail/person
* contains
  * details about the reservation (firstname, lastname, mail, phone, slots reserved, ...)
  * different message whether on wait list or not
  * a link that the user must click on to confirm his registration
    * link to /confirm_registration API call
