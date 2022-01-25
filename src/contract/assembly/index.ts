import { storage, Context, u128, PersistentMap } from "near-sdk-core"
import { AccountId } from "../../utils"

@nearBindgen
export class Contract {
    private owner: AccountId;
    private minDeposit: u128;
    private deposits: PersistentMap<string, u128> = new PersistentMap<string, u128>("deposit");

    constructor(owner: AccountId, minDeposit: u128 = u128.One) {
        this.owner = owner;
        this.minDeposit = minDeposit;
    };

    @mutateState()
    deposit(): void {
        const deposit = Context.attachedDeposit;
        assert(deposit >= this.minDeposit, `Deposit should be at least ${this.minDeposit} yNear`);
        assert(!this.deposits.contains(Context.sender), "You already have a deposit");

        this.deposits.set(Context.sender, deposit);
    }
}