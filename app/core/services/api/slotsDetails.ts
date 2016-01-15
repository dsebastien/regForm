/**
 * Represent information about slots
 */
export class SlotsDetails {
	total:number;
	used:number;
	remaining:number;

	constructor(totalSlots:number, usedSlots:number, remainingSlots:number) {
		this.total = totalSlots;
		this.used = usedSlots;
		this.remaining = remainingSlots;
	}
}
