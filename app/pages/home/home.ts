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
	private firstName:string = "";
	private lastName:string = "";
	private email:string = "";
	private slots:number = 1;

	constructor() {
		console.log("Home component loaded");
	}

	save() {
		console.log("Saving: ", {
			firstName: this.firstName,
			lastName: this.lastName,
			email: this.email,
			slots: this.slots
		});
		//TODO implement
	}

	setSlots(slots:number) {
		this.slots = slots;
	}
}
