/// <reference path="../../../../typings/main.d.ts" />
/// <reference path="../../../../typings/custom.d.ts" />


"use strict";

// import Angular 2
import {Injectable} from "angular2/core";
import {Http, Headers, Response, RequestMethod, RequestOptions} from "angular2/http";

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
import {RegistrationDetailsModel} from "./registrationDetails.model";

/*
 * Service responsible for requesting/checking tokens.
 * Must be loaded as soon as possible in the application
 */
@Injectable()
export class ApiService {
	private http:Http;
	private static LOCALSTORAGE_TOKEN_VARIABLE:string = "id_token";
	private currentTokenDetails:TokenDetails<string> = null;
	private tokenConverter:TokenConverter<string> = new TokenConverter<string>();

	constructor(http:Http) {
		console.log("Loading the API service");
		this.http = http;

		if (http === null) {
			throw new Error("The HTTP service has not been provided but is mandatory!");
		}

		this.checkToken(); // after this point, a token should be available
	}

	private checkToken() {
		let newTokenRequired:boolean = false;

		if (this.currentTokenDetails !== undefined && this.currentTokenDetails !== null) {
			if (!ApiService.isTokenStillValid(this.currentTokenDetails)) {
				this.saveNewToken();
			}
			return;
		}

		// if there is no token yet
		const currentTokenObservable:Observable<string> = ApiService.getCurrentToken();
		currentTokenObservable.subscribe((value:Token<string>) => {
			if (value !== null) {
				const tokenDetails:TokenDetails<string> = this.tokenConverter.fromJSONToToken(value);
				console.log("Token loaded: ", tokenDetails);
				if (ApiService.isTokenStillValid(tokenDetails) === false) {
					newTokenRequired = true;
				} else {
					console.log("No need to request a new token");
					this.currentTokenDetails = tokenDetails;
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
			.map((res:Response) => res.json())
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

	private static isTokenStillValid(token:TokenDetails<string>):boolean {
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

	private getAuthenticatedRequestHeaders():Headers {
		let retVal:Headers = new Headers();
		retVal.append(Configuration.authorizationHeaderPrefix + Configuration.authorizationHeaderName, Configuration.authorizationValuePrefix + this.currentTokenDetails.token);
		//retVal.append('Content-Type', 'application/x-www-form-urlencoded');
		retVal.append('Content-Type', 'application/json');

		return retVal;
	}

	public getSlots():Observable<SlotsDetails> {
		const retVal:Subject<SlotsDetails> = new Subject<SlotsDetails>();
		this.http.get(Configuration.slotsEndpoint)
			//TODO implement.retry(3)
			.map((res:Response) => res.json())
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

	public register(registrationDetails:RegistrationDetailsModel):any {
		this.checkToken(); // TODO check if works as expected

		const authenticationHeaders:Headers = this.getAuthenticatedRequestHeaders();
		const requestOptions:any = {
			headers: authenticationHeaders
		};
		const body = {
			"firstName": registrationDetails.firstName,
			"lastName": registrationDetails.lastName,
			"email": registrationDetails.email,
			"phone": registrationDetails.phone,
			"slots": registrationDetails.slots,
			"member": registrationDetails.member,
			"waitList": registrationDetails.waitList
		};
		console.log("Sending the following registration: ", body);
		
		this.http.post(Configuration.registrationEndpoint, JSON.stringify(body), requestOptions)
			.map((res:Response) => {
				if (res.status === 200) {
					return res.json();
				}
				
				// FIXME handle all errors
				throw new Error("Error: "+res.status);
				//	* 401: unauthorized (no token)
				//	* 403: forbidden (token, invalid, outdated, ...)
				//	* 400: bad request (invalid input)
				//	* 409: mail already registered. Body of the response:
				//		{ "email_already_registered": "<email>" } 
				//	* 409: not enough slots available. Body of the response:
				//		{ "not_enough_slots_available": "<remaining_slots>" }
			})
			.subscribe(
				(data:any) => {
					//FIXME implement
					console.log("Data: ", data)
				},
				(err:any) => {
					//FIXME implement
					console.log("Error: ", err);
				}
			);
		
		//TODO set correct return type 
	}
}
