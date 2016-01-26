"use strict";

// import Angular 2
import {Component, AfterViewInit} from "angular2/core";
import {NgForm, FORM_DIRECTIVES} from "angular2/common";

import {RegisterMaterialDesignLiteElement} from "../../core/directives/registerMaterialDesignLiteElement";

import {RegistrationDetailsModel} from "../../core/services/api/registrationDetails.model";

// Google's reCaptcha
// reference: https://developers.google.com/recaptcha/intro
declare var grecaptcha:any;

// import RxJS
import {Observable, Subject} from "rxjs";
import "rxjs/add/operator/map";

import {ApiService} from "../../core/services/api/apiService";
import {SlotsDetails} from "../../core/services/api/slotsDetails";

@Component({
	selector: "page-home",
	templateUrl: "pages/home/home.template.html",
	directives: [RegisterMaterialDesignLiteElement, FORM_DIRECTIVES]
})
export class Home implements AfterViewInit {
	private model = new RegistrationDetailsModel();

	private captchaCompleted:boolean = false;
	private captchaResponse:string = "";

	private apiService:ApiService;

	// information about the slots
	private slots: SlotsDetails;

	constructor(apiService:ApiService) {
		this.apiService = apiService;

		const slotsObservable:Observable<SlotsDetails> = apiService.getSlots();
		slotsObservable.subscribe((value:SlotsDetails) => {
			console.log("Received slots details");
			this.slots = value;
		}, (error) => {
			console.log("Could not get the slots details: ", error);
		}, () => {
			console.log("Slots details loaded");
		});

		console.log("Home page loaded");
	}

	/**
	 * Initialize the captcha once the view is initialized.
	 * Without this, reCaptcha does not initialize correctly
	 */
	ngAfterViewInit() {
		// reference: https://developers.google.com/recaptcha/intro
		grecaptcha.render("captcha", {
			"sitekey" : "6LcJrRQTAAAAAK_cw8EkdLatCK9pGGKcDDPKnq-q",
			"callback" : this.captchaCallback,
			"theme" : "light"
		});
	}

	public captchaCallback = (response:any) => {
		this.captchaResponse = response;
		this.captchaCompleted = true;
		// note that this method is defined using an arrow function to avoid scoping issues with 'this' given that it's used as a callback
	};

	captchaCompletedSuccessfully() {
		return this.captchaCompleted;
	}

	onSubmit() {
		if(!this.captchaCompleted) {
			console.log("Cannot submit form if the captcha has not been completed!");
			// todo reset captcha (?) / display error?
			return;
		}
		
		this.apiService.register(this.model);

		// todo handle service call result
		//TODO implement
		// avoid multiple form submissions
		this.model = new RegistrationDetailsModel();
		// FIXME reset the captcha too
		// TODO get the result and redirect the user if needed 
	}

	// TODO remove this workarond when we know how to handle radio button groups with ngForm ngModel ...
	setSlots(slots:number) {
		this.model.slots = slots;
	}
	
	shouldDisplayWaitListChoice(): boolean {
		let retVal:boolean = false;
		
		if(this.slots !== null && this.slots !== undefined){
			const percentageUsed = (this.slots.used / this.slots.total) * 100;
			if(percentageUsed >= 90 || this.slots.remaining <= 10){
				retVal = true;
			}
		}
		
		return retVal;
	}
}
