"use strict";

// import Material design lite

// import Angular2 deps
import "reflect-metadata";

// import Angular 2
import {Component, provide, bootstrap} from "angular2/angular2";
import {Http, HTTP_PROVIDERS} from "angular2/http";

// import Angular 2 Component Router
// reference: http://blog.thoughtram.io/angular/2015/06/16/routing-in-angular-2.html
import {RouteConfig, Route, RouterOutlet, RouterLink, Router, LocationStrategy, PathLocationStrategy, ROUTER_PROVIDERS} from "angular2/router";
// todo add HTML5LocationStrategy (whatever the new name) & remove path location strategy

// app components
import {Home} from "../pages/home/home";

// app services
//import {appServicesInjectables} from "core/services/services";

@Component({
	selector: "app",
	templateUrl: "core/core.bootstrap.template.html", //template: "<router-outlet></router-outlet>",
	directives: [RouterOutlet, RouterLink]
})
@RouteConfig([
	//TODO put back the old syntax (comment below) once the typings are correct
	// reference: https://github.com/angular/angular/issues/3637
	// fix could land w/ 36+
	{path: "/", component: Home, as: "Home", data: undefined}
	/*
	 new Route({path: "/", component: Home, as: "Home", data: undefined}), // written differently
	 */


])
class App {
	constructor() {
		console.log("Application bootstrapped!");
	}
}

// bootstrap our app
console.log("Bootstrapping the App");

// in [] is the list of injector bindings. Those bindings are used when an injector is created. Passing these here make the bindings available application-wide
bootstrap(App, [
	//appServicesInjectables, // alternative way of filling the injector with all the classes we want to be able to inject
	ROUTER_PROVIDERS,
	HTTP_PROVIDERS,
	provide(LocationStrategy, {useClass: PathLocationStrategy}) // enables the following: /#/<component_name> rather than /<component_name>
	//todo replace with
	//bind(LocationStrategy).toClass(HTML5LocationStrategy) // enable HTML5 history API location strategy

]).then(
	success => {
		console.log("Bootstrap successful");
		// workaround to ensure that DOM nodes corresponding to Material Design Lite components added through Angular are registered correctly (i.e., make the JS part of Material Design Lite work with Angular)
		// reference: http://stackoverflow.com/questions/31278781/material-design-lite-integration-with-angularjs
		/*
		var mdlUpgradeDom = false;
		setInterval(function() {
			if (mdlUpgradeDom) {
				componentHandler.upgradeDom();
				mdlUpgradeDom = false;
			}
		}, 200);

		var observer = new MutationObserver(function () {
			mdlUpgradeDom = true;
		});
		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
		*/
	},
	error => console.error(error)
);
