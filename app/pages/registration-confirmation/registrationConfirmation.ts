"use strict";

// import Angular 2
import {Component} from "angular2/core";

import {RegisterMaterialDesignLiteElement} from "../../core/directives/registerMaterialDesignLiteElement";

@Component({
	selector: "page-registration-confirmation",
	templateUrl: "pages/registration-confirmation/registrationConfirmation.template.html",
	directives: [RegisterMaterialDesignLiteElement]
})
export class RegistrationConfirmation {

	constructor() {
		console.log("Registration confirmation page loaded");
	}
}
