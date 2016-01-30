"use strict";

// import the application
import {App} from "./app";

// import Angular 2
import {bootstrap} from "angular2/platform/browser";
import {provide, enableProdMode} from "angular2/core";
import {HTTP_PROVIDERS} from "angular2/http";

// import Angular 2 Component Router
// reference: http://blog.thoughtram.io/angular/2015/06/16/routing-in-angular-2.html
import {LocationStrategy, PathLocationStrategy, HashLocationStrategy, ROUTER_PROVIDERS} from "angular2/router";

// enable production mode of Angular
enableProdMode();

// bootstrap our app
console.log("Bootstrapping the App");

// in [] is the list of injector bindings. Those bindings are used when an injector is created. Passing these here make the bindings available application-wide
bootstrap(App, [
	//appServicesInjectables, // alternative way of filling the injector with all the classes we want to be able to inject
	ROUTER_PROVIDERS,
	HTTP_PROVIDERS,
	provide(LocationStrategy, {useClass: HashLocationStrategy}) // can be switched to PathLocationStrategy (requires server config for URL rewriting)

]).then(
	(success:any) => {
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
	(error:any) => console.error(error)
);
