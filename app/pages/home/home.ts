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
	private phone:string = "";
	private slots:number = 1;
	private member: boolean = false;
	private waitList:boolean = false;

	constructor() {
		console.log("Home component loaded");
	}

	submit() {
		console.log("Saving: ", {
			firstName: this.firstName,
			lastName: this.lastName,
			email: this.email,
			phone: this.phone,
			slots: this.slots,
			member: this.member,
			waitList: this.waitList
		});
		//TODO implement
	}

	setSlots(slots:number) {
		this.slots = slots;
	}
}
