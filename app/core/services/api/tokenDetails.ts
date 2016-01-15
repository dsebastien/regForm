/**
 * Class that represents a token of some sort
 */
export class TokenDetails<TokenType> implements Token<TokenType> {
	token:TokenType;
	expirationTime:number;

	constructor(token:TokenType, expirationTime:number) {
		if (token === null || token === undefined) {
			throw new Error("The token cannot be null or undefined!");
		}
		this.token = token;
		this.expirationTime = expirationTime;
	}
}

export interface Token<TokenType>{
	token:TokenType;
	expirationTime:number;
}
