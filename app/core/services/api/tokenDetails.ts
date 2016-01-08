/**
 * Class that contains a token of some sort
 */
export class TokenDetails<TokenType> {
	token: TokenType;
	expirationTime: number;
}
