import { VMContext } from "near-sdk-as";
import { onboardAccount } from "..";
import { onboardLookup } from "../model";

const inputAccountId: string = "onboard.testnet";

describe("onboard test", () => {
	afterEach(() => {
		onboardLookup.delete(inputAccountId);
	});

	it("should not onboard a user", () => {
		VMContext.setSigner_account_id("test.testnet");
		expect(onboardAccount(inputAccountId)).toBe(0, "should not be onboarded");
		expect(onboardLookup.contains(inputAccountId)).toBe(false);
	});

	it("should onboard a user succesfully", () => {
		VMContext.setSigner_account_id("capsule.testnet");
		expect(onboardAccount(inputAccountId)).toBe(1);
		expect(onboardLookup.contains(inputAccountId)).toBe(
			true,
			"should be onboarded"
		);
	});

	it("should not onboard a user: invalid accountId length", () => {
		VMContext.setSigner_account_id("capsule.testnet");
		expect(onboardAccount("a")).toBe(2);
		expect(onboardLookup.contains("a")).toBe(false);
	});

	it("should not onboard a user: invalid accountId length", () => {
		VMContext.setSigner_account_id("capsule.testnet");
		const longAccId =
			"abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklm";
		expect(onboardAccount(longAccId)).toBe(2);
		expect(onboardLookup.contains(longAccId)).toBe(false);
	});

	it("should not onboarded an already onboarded user", () => {
		VMContext.setSigner_account_id("capsule.testnet");
		onboardAccount(inputAccountId);
		expect(onboardAccount(inputAccountId)).toBe(3, "cannot onboard twice");
	});
});
