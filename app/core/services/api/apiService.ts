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

		this.initialize();

		//localForage.setItem(ApiService.LOCALSTORAGE_TOKEN_VARIABLE, "cool", (err, result) => { alert(result);});
		//localForage.clear();
		//FIXME check that items can be read back
	}

	private initialize = () => {
		let newTokenRequired:boolean = false;
		
		const currentTokenObservable:Observable<string> = this.getCurrentToken();
		currentTokenObservable.subscribe(value => {
			if (value !== null) {
				console.log("Token loaded: ", value);
				//FIXME need to convert back to TokenDetails
			} else {
				console.log("No token present!");
				newTokenRequired = true;
			}
		}, (error) => {
			console.log("Could not retrieve the current token.");
			newTokenRequired = true;
		}, () => {
			if (newTokenRequired === true) {
				console.log("We totally need a new token!!");
			}
		});

		//localForage.setItem(ApiService.LOCALSTORAGE_TOKEN_VARIABLE, "cool", (err, result) => { alert(result);});
		//localForage.clear();
		//FIXME check that items can be read back
		
	}

	private getCurrentToken():Observable<string> {
		return Observable.fromPromise(localForage.getItem(ApiService.LOCALSTORAGE_TOKEN_VARIABLE));
	}

	private requestToken():Observable<any> {
		const retVal:Subject<TokenDetails<string>> = new Subject<TokenDetails<string>>();
		console.log("Requesting token...");
		const lastTokenRequestTime = Date.now();
		this.http.get(Configuration.tokenGenerationEndpoint)
			.map(res => res.json())
			.subscribe(tokenAsJSON => {
				const token = tokenAsJSON.token;
				const expirationTime = lastTokenRequestTime + (tokenAsJSON.expiresIn * 1000); // seconds to milliseconds
				const tokenDetails = new TokenDetails<string>(token, expirationTime);
				console.log("Token requested on ", new Date(lastTokenRequestTime));
				console.log("The token will expire on: " + new Date(expirationTime));
				this.currentTokenDetails = tokenDetails;
				retVal.next(tokenDetails);
			});
		return retVal;
	}
}
