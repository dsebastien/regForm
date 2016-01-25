import {TokenDetails, Token} from "./tokenDetails";
//import {IllegalArgumentException} from "../../exceptions/illegalArgumentException";

/**
 * Utility methods for tokens
 */
export class TokenConverter<TokenDetailsType> {

	constructor() {
		// constructor
	}

	fromTokenToJSON(token:TokenDetails<TokenDetailsType>) {
		if(token === null || token === undefined) {
			// TODO use
			//throw new IllegalArgumentException("The token cannot be null or undefined!");

			throw new Error("The token cannot be null or undefined!");
		}

		return JSON.stringify(token);
	}

	fromJSONToToken(object:Token<TokenDetailsType>): TokenDetails<TokenDetailsType> {
		return new TokenDetails<TokenDetailsType>(object.token, object.expirationTime);
	}
}
