"use strict";

import {RegistrationDetailsModel} from "./registrationDetails.model";

export enum RegistrationResultState {
	SUCCEEDED,
	FAILED,
	EMAIL_ALREADY_REGISTERED,
	NOT_ENOUGH_SLOTS_AVAILABLE
}

export class RegistrationResult {
	registrationResultState: RegistrationResultState;
	registrationDetails: RegistrationDetailsModel;
	
	constructor(registrationResultState:RegistrationResultState, registrationDetails:RegistrationDetailsModel) {
		this.registrationResultState = registrationResultState;
		this.registrationDetails = registrationDetails;
	}
}
