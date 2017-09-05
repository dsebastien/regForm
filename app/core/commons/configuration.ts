"use strict";

/**
 * Configuration of the client
 */
export class Configuration {
	private static apiURL = "http://www.duboishubert.be/foire_vetements_api/v2";
	public static tokenGenerationEndpoint = Configuration.apiURL + "/token";
	public static tokenValidationEndpoint = Configuration.apiURL + "/token_check";
	public static slotsEndpoint = Configuration.apiURL + "/slots";
	public static registrationEndpoint = Configuration.apiURL + "/register";
	public static authorizationHeaderPrefix = "HTTP_"; // necessary for my web host as all headers passed by clients are prefixed
	public static authorizationHeaderName = "X_Authorization"; // necessary for my web host as the default/standard "Authorization" never reaches my back-end API. Also, '-' are changed to '_' meaning that I can't even prefix that correctly...
	public static authorizationValuePrefix = "Bearer "; // the token should be added right after that
}
