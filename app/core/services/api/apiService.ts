/// <reference path="../../../../typings/main.d.ts" />
/// <reference path="../../../../typings/custom.d.ts" />


"use strict";

// import Angular 2
import {Injectable} from "angular2/core";
import {Http, Response, RequestMethod, RequestOptions} from "angular2/http";

// import RxJS
import {Observable, Subject} from "rxjs";
import "rxjs/add/operator/map";

// import localForage
//TODO remove and re-import localForage once a solution is found for #41: https://github.com/dsebastien/regForm/issues/41
const localForage:LocalForage = require("localforage");

// import app components
import {Configuration} from "../../commons/configuration";
import {TokenDetails, Token} from "./tokenDetails";
import {TokenConverter} from "./tokenConverter";
import {SlotsDetails} from "./slotsDetails";

/*
 * Service responsible for requesting/checking tokens.
 * Must be loaded as soon as possible in the application
 */
@Injectable()
export class ApiService {
	private http:Http;
	private static LOCALSTORAGE_TOKEN_VARIABLE:string = "id_token";
	private currentTokenDetails:TokenDetails<string>;
	private tokenConverter:TokenConverter<string> = new TokenConverter<string>();

	constructor(http:Http) {
		console.log("Loading the API service");
		this.http = http;

		if (http === null) {
			throw new Error("The HTTP service has not been provided but is mandatory!");
		}

		this.initialize(); // after this point, a token should be available
	}

	private initialize() {
		let newTokenRequired:boolean = false;

		const currentTokenObservable:Observable<string> = ApiService.getCurrentToken();
		currentTokenObservable.subscribe((value:Token<string>) => {
			if (value !== null) {
				const tokenDetails:TokenDetails<string> = this.tokenConverter.fromJSONToToken(value);
				console.log("Token loaded: ", tokenDetails);
				if (this.isTokenStillValid(tokenDetails) === false) {
					newTokenRequired = true;
				} else {
					console.log("No need to request a new token");
				}
			} else {
				console.log("No token available in LocalStorage");
				newTokenRequired = true;
			}
		}, (error) => {
			console.log("Could not retrieve the current token: ", error);
			newTokenRequired = true;
		}, () => {
			if (newTokenRequired === true) {
				console.log("A new token is required...");
				//localForage.setItem(ApiService.LOCALSTORAGE_TOKEN_VARIABLE, null); // clear
				//localForage.clear();
				this.saveNewToken();
			}
		});
	}

	private saveNewToken():void {
		const newTokenObservable:Observable<TokenDetails<string>> = this.requestNewToken();
		newTokenObservable.subscribe((value:TokenDetails<string>) => {
			console.log("Saving the received token: ", value);
			this.currentTokenDetails = value;
			localForage.setItem(ApiService.LOCALSTORAGE_TOKEN_VARIABLE, value, (err, result) => {
				console.log("Token saved in LocalStorage");
			});
		}, (error) => {
			console.log("Could not get a new token: ", error);
		}, () => {
			console.log("Done!");
		});
	}

	private static getCurrentToken():Observable<string> {
		return Observable.fromPromise(localForage.getItem(ApiService.LOCALSTORAGE_TOKEN_VARIABLE));
	}

	private requestNewToken():Observable<TokenDetails<string>> {
		const retVal:Subject<TokenDetails<string>> = new Subject<TokenDetails<string>>();
		console.log("Requesting token...");
		const lastTokenRequestTime = Date.now();
		this.http.get(Configuration.tokenGenerationEndpoint)
			//TODO implement.retry(3)
			.map(res => res.json())
			.subscribe(tokenAsJSON => {
				const token = tokenAsJSON.token;
				const expirationTime = lastTokenRequestTime + (tokenAsJSON.expiresIn * 1000); // seconds to milliseconds
				const tokenDetails = new TokenDetails<string>(token, expirationTime);
				console.log("Token requested on ", new Date(lastTokenRequestTime));
				console.log("The token will expire on: " + new Date(expirationTime));
				retVal.next(tokenDetails);
			});
		return retVal;
	}

	private checkCurrentToken():void {
		console.log("Checking current token");
		if (this.currentTokenDetails !== null && this.currentTokenDetails !== undefined) {
			if (this.isTokenStillValid(this.currentTokenDetails) === false) {
				this.saveNewToken();
			}
		}
	}

	private isTokenStillValid(token:TokenDetails<string>):boolean {
		let retVal:boolean = false;
		if (token !== null && token !== undefined) {
			retVal = Date.now() < token.expirationTime;
		}
		if (retVal === true) {
			console.log("The token is still valid");
		} else {
			console.log("The token is not valid");
		}
		return retVal;
	}

	private prepareProtectedRequest() {
		//FIXME implement
		// prepare Http request
		// add X_Authorization: Bearer <token>
		// return the configured request object
	}

	public getSlots():Observable<SlotsDetails> {
		const retVal:Subject<SlotsDetails> = new Subject<SlotsDetails>();
		this.http.get(Configuration.slotsEndpoint)
			//TODO implement.retry(3)
			.map(res => res.json())
			.subscribe(slotsAsJSON => {
				console.log(slotsAsJSON);
				let slotsDetails = new SlotsDetails(slotsAsJSON.totalSlots, slotsAsJSON.usedSlots, slotsAsJSON.remainingSlots);
				//TODO use to test rendering (see #42)
				//slotsDetails.used = 90;
				slotsDetails.remaining = slotsDetails.total - slotsDetails.used;
				retVal.next(slotsDetails);
			});
		return retVal;
	}

	public register():any {
		console.log("Not implemented yet");
		//TODO implemented (set correct return type) 
	}
}
