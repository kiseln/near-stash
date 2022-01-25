import { storage, Context, u128, PersistentMap, ContractPromiseBatch, ContractPromise } from "near-sdk-core"
import { AccountId, assert_self, assert_single_promise_success, XCC_GAS } from "../../utils"

@nearBindgen
export class Contract {
    private minDeposit: u128;
    private deposits: PersistentMap<string, u128> = new PersistentMap<string, u128>("deposit");

    constructor(minDeposit: u128 = u128.One) {
        this.minDeposit = minDeposit;
    };

    @mutateState()
    deposit(): void {
        const deposit = Context.attachedDeposit;
        assert(deposit >= this.minDeposit, `Deposit should be at least ${this.minDeposit} yNear`);
        assert(!this.deposits.contains(Context.sender), "You already have a deposit");

        this.deposits.set(Context.sender, deposit);
    }

    @mutateState()
    withdraw(): void {
        const sender = Context.sender;
        assert(this.deposits.contains(sender), "You don't have a deposit");

        let deposit = this.deposits.get(sender);
        if (deposit === null) {
            assert(false, "Unexpected error occured");
            return;            
        };

        this.deposits.delete(sender);

        ContractPromiseBatch.create(sender)
            .transfer(deposit)
                .then(Context.contractName)
                .function_call("on_withdraw_complete", new OnWithdrawCompleteArgs(deposit), u128.Zero, XCC_GAS);
    }

    @mutateState()
    on_withdraw_complete(deposit: u128): void {
        assert_self();

        const results = ContractPromise.getResults()
        // If withdraw failed return deposit back to the collection.
        // TODO: If customer made another deposit we will accidentally override it here. Handle this case.
        if (!results[0].succeeded) {
            this.deposits.set(Context.sender, deposit);
        }
    }
}

@nearBindgen
class OnWithdrawCompleteArgs {
    constructor(public deposit: u128) {}
}