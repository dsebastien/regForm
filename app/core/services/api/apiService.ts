/// <reference path="../../../../typings/main.d.ts" />
/// <reference path="../../../../typings/custom.d.ts" />


"use strict";

import {Configuration} from "../../commons/configuration";
import {TokenDetails} from "./tokenDetails";

import {Injectable} from "angular2/core";

import {Http, Response, RequestMethod, RequestOptions} from "angular2/http";
import {Observable, Subject} from "rxjs";
import "rxjs/add/operator/map";

//TODO remove and re-import localForage once a solution is found for #41: https://github.com/dsebastien/regForm/issues/41
const localForage:LocalForage = require("localforage");

/*
 * Service responsible for requesting/checking tokens.
 * Must be loaded as soon as possible in the application
 */
@Injectable()
export class ApiService {
	private http:Http;
	private static HEADER_NAME:string = "Authorization";
	private static HEADER_PREFIX:string = "Bearer";
	private static LOCALSTORAGE_TOKEN_VARIABLE:string = "id_token";
	private currentTokenDetails:TokenDetails<string>;

	constructor(http:Http) {
		console.log("Loading the API service");
		this.http = http;

		if (http === null) {
			throw new Error("The HTTP service has not been provided but is mandatory!");
		}

		this.initializeToken();
		//localForage.setItem("key", "cool", (err, result) => { alert(result.value)});
		//console.log("Saved!");

		//localForage.clear();
		//FIXME check that items can be read back
	}

	private initializeToken() {
		localForage.getItem(ApiService.LOCALSTORAGE_TOKEN_VARIABLE)
			.then((value:string) => {
				if (value === null) {
					// fixme in this case we need to request a new token
					// (saved automatically in this class)
					// put it here in localstorage
				} else {
					console.log("Found: ", value);
				}
			}, (error:Error) => {
				console.error("Error while checking for token presence in LocalStorage")
			});
	}

	private requestToken():Observable<any> {
		const retVal: Subject<TokenDetails> = new Subject<TokenDetails>();
		console.log("Requesting token...");
		const lastTokenRequestTime = Date.now();
		this.http.get(Configuration.tokenGenerationEndpoint)
			.map(res => res.json())
			.subscribe(tokenAsJSON => {
				const tokenDetails = new TokenDetails<string>();
				tokenDetails.token = tokenAsJSON.token;
				tokenDetails.expirationTime = lastTokenRequestTime + (tokenAsJSON.expiresIn * 1000); // seconds to milliseconds
				//console.log("Token requested on ",new Date(this.lastTokenRequestTime));
				console.log("The token will expire on: " + new Date(tokenDetails.expirationTime));
				this.currentTokenDetails = tokenDetails;
				retVal.next(tokenDetails);
			});
		return retVal;
	}

	/*
	 * Checks if the current token is still valid.
	 * If invalid, a new token should be requested
	 * @returns {boolean} true if the token is still valid
	 */
	isTokenStillValid() {
		let retVal:boolean = false;
		if (this.currentTokenDetails !== null) {
			return retVal = Date.now() < this.currentTokenDetails.expirationTime;
		}
		return retVal;
	}
}
