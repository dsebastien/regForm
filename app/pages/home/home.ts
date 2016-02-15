"use strict";

// import Angular 2
import {Component, AfterViewInit} from "angular2/core";
import {NgForm, FORM_DIRECTIVES} from "angular2/common";
import {Router} from "angular2/router";

// Google's reCaptcha
// reference: https://developers.google.com/recaptcha/intro
declare var grecaptcha:any;

// import RxJS
import {Observable, Subject} from "rxjs";
import "rxjs/add/operator/map";

import {RegisterMaterialDesignLiteElement} from "../../core/directives/registerMaterialDesignLiteElement";
import {RegistrationDetailsModel} from "../../core/services/api/registrationDetails.model";
import {RegistrationResult, RegistrationResultState} from "../../core/services/api/registrationResult";
import {ApiService} from "../../core/services/api/apiService";
import {SlotsDetails} from "../../core/services/api/slotsDetails";
import {isNumeric} from "../../core/commons/utils";

@Component({
	selector: "page-home",
	templateUrl: "pages/home/home.template.html",
	directives: [RegisterMaterialDesignLiteElement, FORM_DIRECTIVES]
})
export class Home implements AfterViewInit {
	private model = new RegistrationDetailsModel();

	private captchaCompleted:boolean = false;
	private captchaResponse:string = "";

	private captchaWidgetId:any;

	private apiService:ApiService;
	private slots:SlotsDetails;

	private submitButtonEnabled: boolean = true;

	private router:Router;

	constructor(apiService:ApiService, router: Router) {
		this.apiService = apiService;
		this.router = router;

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
		this.captchaWidgetId = grecaptcha.render("captcha", {
			"sitekey" : "6LcJrRQTAAAAAK_cw8EkdLatCK9pGGKcDDPKnq-q",
			"callback" : this.captchaCallback,
			"theme" : "light"
		});
	}

	public static resetCaptcha(widgetId:any): void {
		// reset the captcha
		grecaptcha.reset(widgetId);
	}

	public captchaCallback = (response:any) => {
		this.captchaResponse = response;
		this.captchaCompleted = true;
		// note that this method is defined using an arrow function to avoid scoping issues with 'this' given that it's used as a callback
	};

	captchaCompletedSuccessfully() {
		return this.captchaCompleted;
	}

	memberNumberIsMissing():boolean {
		let retVal = false;

		const numberShouldBeGiven = this.model.member === true;

		if(numberShouldBeGiven) {
			if(this.model.memberNumber.trim() === "") {
				retVal = true;
			}else if(this.model.memberNumber.length !== 6) {
				retVal = true;
			}else if(!isNumeric(this.model.memberNumber)) {
				retVal = true;
			}
		}

		return retVal;
	}

	submitButtonShouldBeEnabled() {
		return this.submitButtonEnabled && !this.memberNumberIsMissing();
	}

	public onSubmit = () => {
		if(!this.captchaCompleted) {
			console.log("Cannot submit form if the captcha has not been completed!");
			Home.resetCaptcha(this.captchaWidgetId);
			return;
		}

		if(this.memberNumberIsMissing()) {
			console.log("Cannot submit form if the member number has not been given!");
			return;
		}

		// avoid multiple submissions
		this.submitButtonEnabled = false;

		let regResult:RegistrationResult = null;

		const registrationResultObservable:Observable<RegistrationResult> = this.apiService.register(this.model);
		registrationResultObservable.subscribe(
			(registrationResult:RegistrationResult) => {
				regResult = registrationResult;
			},
			(error:any) => {
				console.log("Error (abnormal, should never be called!): ",error);
				this.model = new RegistrationDetailsModel();
				Home.resetCaptcha(this.captchaWidgetId);
				this.submitButtonEnabled = true;
			},
			() => {
				console.log("Registration completed, checking result");
				if(regResult === null || regResult.registrationResultState === RegistrationResultState.FAILED) {
					console.log("Registration failed ",regResult);
					this.router.navigate([
						"/RegistrationError", {
							"message": "Une erreur est survenue pendant votre inscription."
						}
					]);
				}else if(regResult.registrationResultState === RegistrationResultState.NOT_ENOUGH_SLOTS_AVAILABLE) {
					console.log("Not enough slots available!");
					this.router.navigate([
						"/RegistrationFull", {}
					]);
				}else if(regResult.registrationResultState === RegistrationResultState.EMAIL_ALREADY_REGISTERED) {
					console.log("Email already registered!");
					this.router.navigate([
						"/RegistrationError", {
							"message": "Votre réservation a déjà été enregistrée." // set a more generic error message
						}
					]);
				}else if(regResult.registrationResultState === RegistrationResultState.SUCCEEDED) {
					console.log("Succeeded!");
					this.router.navigate([
						"/RegistrationSent", {}
					]);
				}else {
					console.log("Unknown result state: ",regResult.registrationResultState);
					this.router.navigate([
						"/RegistrationError", {
							"message": "Une erreur est survenue pendant votre inscription."
						}
					]);
				}
			}
		);
	};

	setSlots(slots:number) {
		this.model.slots = slots;
	}

	shouldDisplayWaitListChoice(): boolean {
		let retVal:boolean = false;

		if(this.slots !== null && this.slots !== undefined) {
			if(this.slots.remaining <= 1) {
				retVal= true;
			}
		}

		return retVal;
	}
}
