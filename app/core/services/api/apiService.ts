"use strict";

import {Configuration} from "../../commons/configuration";
import {TokenDetails} from "./tokenDetails";

import {Injectable} from "angular2/core";

import {Http, Response, RequestMethod, RequestOptions} from "angular2/http";
import {Observable} from "rxjs";
import "rxjs/add/operator/map";

/**
 * Service responsible for requesting/checking tokens
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
	}

	private requestToken() {
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

	/**
	 * Checks if the current token is still valid.
	 * If invalid, a new token should be requested
	 * @returns {boolean} true if the token is still valid
     */
	isTokenStillValid() {
		return Date.now() < this.currentTokenDetails.expirationTime;
	}
}
