"use strict";

/**
 * Configuration of the client
 */
export class Configuration {
	private static apiURL = "http://www.duboishubert.be/foire_vetements_api/v1";
	public static tokenGenerationEndpoint = Configuration.apiURL + "/token";
	public static tokenValidationEndpoint = Configuration.apiURL + "/token_check";
	public static slotsEndpoint = Configuration.apiURL + "/slots";
}
