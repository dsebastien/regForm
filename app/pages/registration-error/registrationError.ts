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
	private message:string = "";

	constructor(params:RouteParams) {
		console.log("Registration error page loaded");
		this.fetchMessageFromParams(params);
	}

	fetchMessageFromParams(params:RouteParams) {
		this.message = params.get("message");
	}

}
