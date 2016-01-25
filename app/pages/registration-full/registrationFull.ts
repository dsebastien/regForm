"use strict";

// import Angular 2
import {Component} from "angular2/core";

import {RegisterMaterialDesignLiteElement} from "../../core/directives/registerMaterialDesignLiteElement";

@Component({
	selector: "page-registration-full",
	templateUrl: "pages/registration-full/registrationFull.template.html",
	directives: [RegisterMaterialDesignLiteElement]
})
export class RegistrationFull {

	constructor() {
		console.log("Registration full page loaded");
	}
}
