/**
 * Class that contains a token of some sort
 */
export class TokenDetails<TokenType> {
	token:TokenType;
	expirationTime:number;

	constructor(token:TokenType, expirationTime:number) {
		if (token === null) {
			throw new Error("The token cannot be null!");
		}
		this.token = token;
		this.expirationTime = expirationTime;
	}

	isStillValid = ():boolean => {
		return Date.now() < this.expirationTime;
	};
}
