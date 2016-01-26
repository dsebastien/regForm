"use strict";

export class RegistrationDetailsModel {
	uuid:string = "";
	firstName:string = "";
	lastName:string = "";
	email:string = "";
	phone:string = "";
	slots:number = 1;
	member: boolean = false;
	waitList:boolean = false;
}
