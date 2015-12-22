import {Directive, ElementRef} from "angular2/core";

declare var componentHandler:any; // this is necessary to let TypeScript know that the variable exists already

@Directive({
	selector: "[mdl-register-element]"
})
export class RegisterMaterialDesignLiteElement {
	constructor(elementRef:ElementRef) {
		const htmlElement:HTMLElement = elementRef.nativeElement;

		//console.log("Upgrading!");
		componentHandler.upgradeElement(htmlElement);
	}
}
