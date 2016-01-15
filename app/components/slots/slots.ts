"use strict";

// import Angular 2
import {Component, Input} from "angular2/core";

import {RegisterMaterialDesignLiteElement} from "../../core/directives/registerMaterialDesignLiteElement";

import {SlotsDetails} from "../../core/services/api/slotsDetails";

@Component({
	selector: "slots",
	templateUrl: "components/slots/slots.template.html",
	directives: [RegisterMaterialDesignLiteElement]
})
export class Slots {
	// The information about slots is provided, this component does not know how/where to get it
	@Input() private slots:SlotsDetails;

	constructor() {
		//console.log("Slots component loaded");
	}

	public shouldDisplayWarning():boolean {
		// the warning should be displayed if <= 10% of the slots are remaining
		let retVal:boolean = false;
		if (this.slots !== undefined && this.slots !== null) {
			if (((this.slots.remaining / this.slots.total) * 100) <= 10) {
				retVal = true;
			}
		}
		return retVal;
	}
}
