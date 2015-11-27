"use strict";

// import Angular 2
import { Component, CORE_DIRECTIVES } from "angular2/angular2";

import {RegisterMaterialDesignLiteElement} from "../../core/directives/registerMaterialDesignLiteElement";

@Component({
	selector: "page-home",
	templateUrl: "pages/home/home.template.html",
	directives: [CORE_DIRECTIVES, RegisterMaterialDesignLiteElement]
})
export class Home {

	constructor() {
		console.log("Home component loaded");
	}
}
