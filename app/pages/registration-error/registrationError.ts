"use strict";

// import Angular 2
import {Component} from "angular2/core";
import {RouteParams} from "angular2/router";
import {RegisterMaterialDesignLiteElement} from "../../core/directives/registerMaterialDesignLiteElement";

@Component({
	selector: "page-error",
	templateUrl: "pages/registration-error/registrationError.template.html",
	directives: [RegisterMaterialDesignLiteElement]
})
export class RegistrationError {

	constructor() {
		console.log("Registration error page loaded");
	}

}
