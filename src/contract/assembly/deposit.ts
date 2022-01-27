import { u128 } from "near-sdk-as";

@nearBindgen
export class Deposit {
    constructor(public amount: u128, public endTimestamp: u64) {}
}