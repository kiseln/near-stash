import { Context, u128, PersistentMap, ContractPromiseBatch, ContractPromise } from "near-sdk-core"
import { AccountId, assert_self, readableTimespan, minutesToTimestamp, XCC_GAS } from "../../utils"
import { Deposit } from "./deposit";

@nearBindgen
export class Contract {
    private minDeposit: u128;
    private deposits: PersistentMap<AccountId, Deposit> = new PersistentMap<AccountId, Deposit>("deposit");

    constructor(minDeposit: u128 = u128.One) {
        this.minDeposit = minDeposit;
    };

    @mutateState()
    deposit(lockPeriodInMinutes: u64 = 0): void {
        const amount = Context.attachedDeposit;
        
        assert(amount >= this.minDeposit, `Deposit should be at least ${this.minDeposit} yNear`);
        assert(!this.deposits.contains(Context.sender), "You already have a deposit");

        let endTimestamp = Context.blockTimestamp + minutesToTimestamp(lockPeriodInMinutes);
        
        this.deposits.set(Context.sender, new Deposit(amount, endTimestamp));
    }

    @mutateState()
    withdraw(): void {
        const sender = Context.sender;
        assert(this.deposits.contains(sender), "You don't have a deposit");

        let deposit = this.deposits.getSome(sender);
        assert(deposit.endTimestamp <= Context.blockTimestamp,
            `You will be able to withdraw your deposit in ${readableTimespan(deposit.endTimestamp - Context.blockTimestamp)}`);

        this.deposits.delete(sender);

        ContractPromiseBatch.create(sender)
            .transfer(deposit.amount)
                .then(Context.contractName)
                .function_call("on_withdraw_complete", new OnWithdrawCompleteArgs(deposit), u128.Zero, XCC_GAS);
    }

    @mutateState()
    on_withdraw_complete(deposit: Deposit): void {
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
    constructor(public deposit: Deposit) {}
}