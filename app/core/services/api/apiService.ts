"use strict";

import {Configuration} from "../../commons/configuration";

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
	private token:String = "";
	private lastTokenExpirationTime:number;

	constructor(http:Http) {
		console.log("Loading the API service");
		this.http = http;
	}

	initialize() {
		// todo use localForage to retrieve the token if present
		this.requestToken();
	}

	private requestToken() {
		// todo if there is already a token in local storage check if it is still valid
		// if it is then do nothing

		const lastTokenRequestTime = Date.now();
		this.http.get(Configuration.tokenGenerationEndpoint)
			.map(res => res.json())
			.subscribe(tokenAsJSON => {
				this.token = tokenAsJSON.token;
				this.lastTokenExpirationTime = lastTokenRequestTime + (tokenAsJSON.expiresIn * 1000); // seconds to milliseconds
				//console.log(this.lastTokenRequestTime);
				//console.log(new Date(this.lastTokenRequestTime));
				//console.log(this.lastTokenExpirationTime);
				console.log("The token will expire on: " + new Date(this.lastTokenExpirationTime));
			});
	}

	isTokenStillValid() {
		return Date.now() < this.lastTokenExpirationTime;
	}
}
