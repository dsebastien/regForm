"use strict";

// import Angular 2
import {Component} from "angular2/core";

import {RegisterMaterialDesignLiteElement} from "../../core/directives/registerMaterialDesignLiteElement";

@Component({
	selector: "page-registration-already-confirmed",
	templateUrl: "pages/registration-already-confirmed/registrationAlreadyConfirmed.template.html",
	directives: [RegisterMaterialDesignLiteElement]
})
export class RegistrationAlreadyConfirmed {

	constructor() {
		console.log("Registration already confirmed page loaded");
	}
}
