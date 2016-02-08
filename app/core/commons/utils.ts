/**
 * Ensure that the given value is numeric.
 * Reference: http://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
 * @param n the value to check
 * @returns {boolean}
 */
export function isNumeric(n:any):boolean {
	return !isNaN(parseFloat(n)) && isFinite(n);
}
