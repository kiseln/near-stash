import { u128, VMContext } from "near-sdk-as";
import { Contract } from "../assembly/index";

let contract: Contract;

beforeEach(() => {
    VMContext.setSigner_account_id("user1");
    contract = new Contract();
});

describe("Contract deposit", () => {
    it("should not allow zero deposits with default minimum", () => {
        VMContext.setAttached_deposit(u128.Zero);
        expect(() => { contract.deposit(); }).toThrow();
    });

    it("should not allow deposits less than defined minimum", () => {
        contract = new Contract(new u128(10));
        VMContext.setAttached_deposit(new u128(4));
        expect(() => { contract.deposit(); }).toThrow();
    });

    it("should deposit if amount is higher than minimum", () => {
        VMContext.setAttached_deposit(new u128(4));
        expect(() => { contract.deposit(); }).not.toThrow();
    });

    it("should not allow more than one deposit from a single sender", () => {
        VMContext.setAttached_deposit(new u128(4));
        contract.deposit();
        expect(() => { contract.deposit(); }).toThrow();
    });
});

describe("Contract withdraw", () => {
    beforeEach(() => {
        VMContext.setSigner_account_id("user1");
        VMContext.setAttached_deposit(new u128(4));
        contract.deposit();
    });

    it("should fail if there is no deposit found", () => {
        VMContext.setSigner_account_id("user2");
        expect(() => { contract.withdraw(); }).toThrow();
    });

    it("should withdraw if deposit exists", () => {
        contract.withdraw();
    });

    it("should delete the deposit after withdrawing", () => {
        contract.withdraw();
        expect(() => { contract.withdraw(); }).toThrow();
    });
});

describe("Contract withdraw", () => {
    beforeEach(() => {
        VMContext.setAttached_deposit(new u128(4));
        VMContext.setBlock_timestamp(1643297131_000_000_000);
        contract.deposit(10);
    });

    it("should allow withdraw if required time has passed", () => {
        VMContext.setBlock_timestamp(1643297843_000_000_000)
        expect(() => { contract.withdraw(); }).not.toThrow();
    });

    it("should not allow withdraw if required time hasn't passed", () => {
        VMContext.setBlock_timestamp(1643297283_000_000_000)
        expect(() => { contract.withdraw(); }).toThrow();
    });
});