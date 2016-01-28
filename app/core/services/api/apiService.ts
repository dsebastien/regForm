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
import {RegistrationResult, RegistrationResultState} from "./registrationResult";

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

	private getAuthenticatedRequestOptions():any {
		const httpHeaders:Headers = new Headers();
		httpHeaders.append(Configuration.authorizationHeaderPrefix + Configuration.authorizationHeaderName, Configuration.authorizationValuePrefix + this.currentTokenDetails.token);
		httpHeaders.append("Content-Type", "application/json");

		return {
			headers: httpHeaders
		};
	}

	public getSlots():Observable<SlotsDetails> {
		const retVal:Subject<SlotsDetails> = new Subject<SlotsDetails>();
		this.http.get(Configuration.slotsEndpoint)
			//TODO implement.retry(3)
			//TODO do the mapping in .map and return that observable directly instead of wrapping
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

	public register(registrationDetails:RegistrationDetailsModel):Observable<RegistrationResult> {
		this.checkToken();

		// FIXME implement and return separate observable; see https://github.com/angular/angular/issues/6490
		// const retVal:Observable<RegistrationResult> = new Observable<RegistrationResult>();

		const requestOptions:any = this.getAuthenticatedRequestOptions();

		const requestBody = {
			"firstName": registrationDetails.firstName,
			"lastName": registrationDetails.lastName,
			"email": registrationDetails.email,
			"phone": registrationDetails.phone,
			"slots": registrationDetails.slots,
			"member": registrationDetails.member,
			"waitList": registrationDetails.waitList
		};
		console.log("Sending the following registration: ", requestBody);

		return this.http.post(Configuration.registrationEndpoint, JSON.stringify(requestBody), requestOptions)
			.map((res:Response) => {
				console.log("Registration result: ",res.status);

				let registrationResult: RegistrationResult;
				let registrationDetails: RegistrationDetailsModel = new RegistrationDetailsModel();
				let registrationResultState: RegistrationResultState = RegistrationResultState.FAILED;

				if (res.status === 200) {
					let jsonResult:any = null;
					try {
						jsonResult = res.json();
						registrationDetails.uuid = jsonResult.uuid;
						registrationDetails.firstName = jsonResult.firstName;
						registrationDetails.lastName = jsonResult.lastName;
						registrationDetails.email = jsonResult.email;
						registrationDetails.phone = jsonResult.phone;
						registrationDetails.slots = jsonResult.slots;
						registrationDetails.member = jsonResult.member;
						registrationDetails.waitList = jsonResult.waitList;
						registrationResultState = RegistrationResultState.SUCCEEDED;
						console.log("Registration suceeded!");
					} catch(e) {
						console.log("Registration failed. Issue while parsing 200 OK response");
						registrationResultState = RegistrationResultState.FAILED;
					}
				}else if (res.status === 400 || 401 || 403) {
					// 400: bad request
					// 401: unauthorized (no token)
					// 403: forbidden (token invalid, outdated, ...)
					console.log("Registration failed. Status code: ",res.status);
					registrationResultState = RegistrationResultState.FAILED;
				}else if (res.status === 409) {
					console.log("Registration failed. Status code: ",res.status);
					let jsonResult: any;
					try {
						jsonResult = res.json();

						if(jsonResult.hasOwnProperty("email_already_registered")) {
							registrationResultState = RegistrationResultState.EMAIL_ALREADY_REGISTERED;
						}else if(jsonResult.hasOwnProperty("not_enough_slots_available")) {
							registrationResultState = RegistrationResultState.NOT_ENOUGH_SLOTS_AVAILABLE;
						}else {
							console.log("Unknown conflict");
							registrationResultState = RegistrationResultState.FAILED;
						}
					} catch(e) {
						registrationResultState = RegistrationResultState.FAILED;
					}
				}else {
					console.log("Registration failed. Status code: ",res.status);
					registrationResultState = RegistrationResultState.FAILED;
				}

				registrationResult = new RegistrationResult(registrationResultState, registrationDetails);
				return registrationResult;
			});
	}
}
