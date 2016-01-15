"use strict";

// import Angular 2
import {Component, AfterViewInit} from "angular2/core";
import {NgForm, FORM_DIRECTIVES} from "angular2/common";

import {RegisterMaterialDesignLiteElement} from "../../core/directives/registerMaterialDesignLiteElement";

import {RegistrationDetailsModel} from "./registrationDetails.model";

// Google's reCaptcha
// reference: https://developers.google.com/recaptcha/intro
declare var grecaptcha:any;

@Component({
	selector: "page-home",
	templateUrl: "pages/home/home.template.html",
	directives: [RegisterMaterialDesignLiteElement, FORM_DIRECTIVES]
})
export class Home implements AfterViewInit {
	private model = new RegistrationDetailsModel();

	private captchaCompleted:boolean = false;
	private captchaResponse:string = "";

	constructor() {
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

		console.log("Saving: ", {
			firstName: this.model.firstName,
			lastName: this.model.lastName,
			email: this.model.email,
			phone: this.model.phone,
			slots: this.model.slots,
			member: this.model.member,
			waitList: this.model.waitList
		});
		//TODO implement
		//TODO test print(this.model);
		//FIXME avoid multiple form submissions!
	}

	// TODO remove this workarond when we know how to handle radio button groups with ngForm ngModel ...
	setSlots(slots:number) {
		this.model.slots = slots;
	}
}
