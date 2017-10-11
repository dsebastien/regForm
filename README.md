# regform

## About
Registration form is a simple proof of concept to integrate Angular 2 and Material Design Lite.

This project was created using the [ModernWebDev Yeoman Generator](https://github.com/dsebastien/modernWebDevGenerator) by [dSebastien](https://twitter.com/dSebastien).

## Material Design Lite integration
When Angular 2 instanciates the views (i.e., parses the templates and generates new DOM elements), the generated DOM elements corresponding to Material Design Lite elements are not 'registered'. That step is necessary so that the JavaScript part of Material Design Lite can work for those components.

This is described here: http://www.getmdl.io/started/index.html#dynamic.

In order to make this work, there are multiple options that all involve the componentHandler, which is a global object added by Material Design Lite when it loads.

In this project I'm trying out the different options; so far:
* function scheduled with setInterval after the boostrap of the Angular 2 appl that uses the [MutationObserver](https://developer.mozilla.org/en/docs/Web/API/MutationObserver) API to be notified of DOM changes and calls `componentHandler.upgradeDom()` when needed
* @Directive to manually attach to each Material Design Lite component that takes care of the registration using `componentHandler.upgradeElement(htmlElement)`

There are more options to try out though:
* an `afterViewInit` hook
* a custom decorator that does this for all components (could be more effective and less intrusive)
* another solution that could do this globally with the least effort
* ...

I've taken some inspiration from: https://github.com/jadjoubran/angular-material-design-lite


## How to build
First, make sure that you have installed the required global npm packages: `npm install gulp --global --no-optional`.

Next, if you have used the `--skip-install` option, then you also need to install the project dependencies using `npm run setup`.

For more details about the build, refer to the [ModernWebDevBuild](https://github.com/dsebastien/modernWebDevBuild) project documentation.

![Helped out by Jetbrains!](http://www.underconsideration.com/brandnew/archives/jetbrains_logo_detail.jpg)
