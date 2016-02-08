"use strict";

export class RegistrationDetailsModel {
	uuid:string = "";
	firstName:string = "";
	lastName:string = "";
	email:string = "";
	city:string = "";
	phone:string = "";
	slots:number = 1;
	member: boolean = false;
	memberNumber:string = "";
	waitList:boolean = false;
}
