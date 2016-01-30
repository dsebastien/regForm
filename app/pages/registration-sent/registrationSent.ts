"use strict";

// import Angular 2
import {Component} from "angular2/core";

import {RegisterMaterialDesignLiteElement} from "../../core/directives/registerMaterialDesignLiteElement";

@Component({
	selector: "page-registration-sent",
	templateUrl: "pages/registration-sent/registrationSent.template.html",
	directives: [RegisterMaterialDesignLiteElement]
})
export class RegistrationSent {

	constructor() {
		console.log("Registration sent page loaded");
	}
}
