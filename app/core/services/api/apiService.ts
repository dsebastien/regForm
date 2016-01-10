/// <reference path="../../../../typings/main.d.ts" />
/// <reference path="../../../../typings/custom.d.ts" />


"use strict";

import {Configuration} from "../../commons/configuration";
import {TokenDetails} from "./tokenDetails";

import {Injectable} from "angular2/core";

import {Http, Response, RequestMethod, RequestOptions} from "angular2/http";
import {Observable} from "rxjs";
import "rxjs/add/operator/map";

//import {localForage} from "localforage";
import _localForage = require("localforage");
var localForage = _localForage.localForage;
//import {default as localForage} from "localforage"; // alternative syntax using the current localForage typings...

/*
 * Service responsible for requesting/checking tokens.
 * Must be loaded as soon as possible in the application
 */
@Injectable()
export class ApiService {
	private http:Http;
	private static headerName:string = "Authorization";
	private static headerPrefix:string = "Bearer";
	private static localStorageTokenVariableName:string = "id_token";
	private currentTokenDetails:TokenDetails<string> = new TokenDetails<string>();

	constructor(http:Http) {
		console.log("Loading the API service");
		this.http = http;
		//TODO validate that http was actually received
		// todo use localForage to retrieve the token if present
		// if present, check validity before requesting a new one
		this.requestToken();
		localForage.setItem("key", "cool");
		console.log("Saved!");
		//localForage.clear();
		//FIXME check that items can be read back
	}

	private requestToken() {
		console.log("Requesting token...");
		// todo if there is already a token in local storage check if it is still valid
		// if it is then do nothing

		const lastTokenRequestTime = Date.now();
		this.http.get(Configuration.tokenGenerationEndpoint)
			.map(res => res.json())
			.subscribe(tokenAsJSON => {
				this.currentTokenDetails.token = tokenAsJSON.token;
				this.currentTokenDetails.expirationTime = lastTokenRequestTime + (tokenAsJSON.expiresIn * 1000); // seconds to milliseconds
				//console.log(this.lastTokenRequestTime);
				//console.log(new Date(this.lastTokenRequestTime));
				//console.log(this.lastTokenExpirationTime);
				console.log("The token will expire on: " + new Date(this.currentTokenDetails.expirationTime));
			});
	}

	/*
	 * Checks if the current token is still valid.
	 * If invalid, a new token should be requested
	 * @returns {boolean} true if the token is still valid
     */
	isTokenStillValid() {
		return Date.now() < this.currentTokenDetails.expirationTime;
	}
}
