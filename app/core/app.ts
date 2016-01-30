"use strict";

import {ApiService} from "./services/api/apiService";

// import Angular 2
import {Component, provide} from "angular2/core";
import {Http, HTTP_PROVIDERS} from "angular2/http";

// import Angular 2 Component Router
// reference: http://blog.thoughtram.io/angular/2015/06/16/routing-in-angular-2.html
import {RouteConfig, Route, RouterOutlet, RouterLink, Router} from "angular2/router";

// import RxJS
import {Observable, Subject} from "rxjs";
import "rxjs/add/operator/map";

// app components
import {Home} from "../pages/home/home";
import {Slots} from "../components/slots/slots";
import {SlotsDetails} from "./services/api/slotsDetails";
import {RegistrationConfirmation} from "../pages/registration-confirmation/registrationConfirmation";
import {RegistrationFull} from "../pages/registration-full/registrationFull";
import {RegistrationError} from "../pages/registration-error/registrationError";

@Component({
	selector: "app",
	templateUrl: "core/app.template.html", //template: "<router-outlet></router-outlet>",
	directives: [RouterOutlet, RouterLink, Slots],
	providers: [ApiService]
})
@RouteConfig([
	{path: "/", component: Home, as: "Home", data: undefined},
	{path: "/registrationConfirmation", component: RegistrationConfirmation, as: "RegistrationConfirmation", data: undefined},
	{path: "/registrationFull", component: RegistrationFull, as: "RegistrationFull", data: undefined},
	{path: "/registrationError", component: RegistrationError, as: "RegistrationError", data: undefined}
])
export class App {
	private apiService:ApiService;

	// information about the slots
	private slots: SlotsDetails;

	/*
	 * We retrieve the API service only to be sure that it is initialized right off the bat
	 * @param apiService
     */
	constructor(apiService:ApiService) {
		this.apiService = apiService;
		console.log("Application bootstrapped!");

		const slotsObservable:Observable<SlotsDetails> = apiService.getSlots();
		slotsObservable.subscribe((value:SlotsDetails) => {
			console.log("Received slots details");
			this.slots = value;
		}, (error) => {
			console.log("Could not get the slots details: ", error);
		}, () => {
			console.log("Slots details loaded");
		});
	}
}
