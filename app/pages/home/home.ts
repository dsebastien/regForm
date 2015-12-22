"use strict";

// import Angular 2
import {Component} from "angular2/core";

import {RegisterMaterialDesignLiteElement} from "../../core/directives/registerMaterialDesignLiteElement";

@Component({
	selector: "page-home",
	templateUrl: "pages/home/home.template.html",
	directives: [RegisterMaterialDesignLiteElement]
})
export class Home {
	name: string = "";
	surname: string = "";
	email: string = "";

	constructor() {
		console.log("Home component loaded");
	}

	save() {
		console.log("Saving: ", this.name);
		//TODO implement
	}
}
