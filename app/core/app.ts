"use strict";

//import {Observable} from "rxjs/Observable";

// import Angular 2
import {Component, provide} from "angular2/core";
import {Http, HTTP_PROVIDERS} from "angular2/http";

// import Angular 2 Component Router
// reference: http://blog.thoughtram.io/angular/2015/06/16/routing-in-angular-2.html
import {RouteConfig, Route, RouterOutlet, RouterLink, Router} from "angular2/router";

// app components
import {Home} from "../pages/home/home";

@Component({
	selector: "app",
	templateUrl: "core/app.template.html", //template: "<router-outlet></router-outlet>",
	directives: [RouterOutlet, RouterLink]
})
@RouteConfig([
	{path: "/", component: Home, as: "Home", data: undefined}
])
export class App {
	constructor() {
		console.log("Application bootstrapped!");
	}
}
