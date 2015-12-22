"use strict";

/**
 * Configuration of the client
 */
export class Configuration {
	public static backendURL = "http://www.duboishubert.be";
	public static tokenGenerationEndpoint = Configuration.backendURL + "/tokens/token.php";
	public static tokenValidationEndpoint = Configuration.backendURL + "/tokens/token_check.php";
}
