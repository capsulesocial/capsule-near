import { VMContext } from "near-sdk-as";
import { onboardAccount, setUserInfo } from "..";
import { accountLookup, onboardLookup, userLookup } from "../model";

const inputAccountId: string = "onboard.testnet";
const inputUsername: string = "testuser";

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

describe("registration test", () => {
	afterEach(() => {
		onboardLookup.delete(inputAccountId);
		onboardLookup.delete("onboard2.testnet");
		accountLookup.delete(inputAccountId);
		userLookup.delete(inputUsername);
	});

	it("should return an error: accountId not onboarded", () => {
		VMContext.setSigner_account_id(inputAccountId);
		expect(setUserInfo(inputUsername)).toBe(6);
		expect(userLookup.contains(inputUsername)).toBe(false);
		expect(accountLookup.contains(inputAccountId)).toBe(false);
	});

	it("should return an error: username length less than mininum required", () => {
		VMContext.setSigner_account_id("capsule.testnet");
		onboardAccount(inputAccountId);

		VMContext.setSigner_account_id(inputAccountId);
		expect(setUserInfo("ab")).toBe(2);
		expect(accountLookup.contains(inputAccountId)).toBe(false);
		expect(userLookup.contains("ab")).toBe(false);
	});

	it("should return an error: username is longer than maximum permissible length", () => {
		VMContext.setSigner_account_id("capsule.testnet");
		onboardAccount(inputAccountId);

		VMContext.setSigner_account_id(inputAccountId);
		expect(setUserInfo("abcdefghijklmnopqrs")).toBe(4);
		expect(accountLookup.contains(inputAccountId)).toBe(false);
		expect(userLookup.contains("abcdefghijklmnopqrs")).toBe(false);
	});

	it("should return an error: username is blocklisted", () => {
		VMContext.setSigner_account_id("capsule.testnet");
		onboardAccount(inputAccountId);

		VMContext.setSigner_account_id(inputAccountId);

		expect(setUserInfo("root")).toBe(7);
		expect(accountLookup.contains(inputAccountId)).toBe(false);
		expect(userLookup.contains("root")).toBe(false);

		// Should this be inside a separate it() ?
		expect(setUserInfo("support")).toBe(7);
		expect(accountLookup.contains(inputAccountId)).toBe(false);
		expect(userLookup.contains("support")).toBe(false);

		// Should this be inside a separate it() ?
		expect(setUserInfo("admin")).toBe(7);
		expect(accountLookup.contains(inputAccountId)).toBe(false);
		expect(userLookup.contains("admin")).toBe(false);

		// TODO: check "capsule" and any username that contains "capsule"
	});

	it("should return an error: username contains invalid characters", () => {
		VMContext.setSigner_account_id("capsule.testnet");
		onboardAccount(inputAccountId);

		VMContext.setSigner_account_id(inputAccountId);

		// Uppercase character not allowed
		expect(setUserInfo("rooT")).toBe(8);
		expect(accountLookup.contains(inputAccountId)).toBe(false);
		expect(userLookup.contains("rooT")).toBe(false);

		// Should this be inside a separate it() ?
		// Dots not allowed
		expect(setUserInfo("suppor.")).toBe(8);
		expect(accountLookup.contains(inputAccountId)).toBe(false);
		expect(userLookup.contains("suppor.")).toBe(false);

		// TODO: more comprehensive tests for identifying invalid chars in usernames
		// TODO: Separate tests for usernameInRange
	});

	it("should register a username succesfully", () => {
		VMContext.setSigner_account_id("capsule.testnet");
		onboardAccount(inputAccountId);

		VMContext.setSigner_account_id(inputAccountId);

		expect(setUserInfo(inputUsername)).toBe(1);
		expect(userLookup.contains(inputUsername)).toBe(true);
		expect(accountLookup.contains(inputAccountId)).toBe(true);
	});

	it("should return an error: accountId linked another user", () => {
		VMContext.setSigner_account_id("capsule.testnet");
		onboardAccount(inputAccountId);

		VMContext.setSigner_account_id(inputAccountId);
		setUserInfo(inputUsername);

		expect(setUserInfo("dupuser")).toBe(5);
		expect(userLookup.contains("dupuser")).toBe(false);
	});

	it("should return an error: cannot update userInfo once registered", () => {
		VMContext.setSigner_account_id("capsule.testnet");
		onboardAccount(inputAccountId);

		VMContext.setSigner_account_id(inputAccountId);
		setUserInfo(inputUsername);

		expect(setUserInfo(inputUsername)).toBe(3);
	});

	it("should return an error: username taken by another accountId", () => {
		VMContext.setSigner_account_id("capsule.testnet");
		onboardAccount(inputAccountId);
		onboardAccount("onboard2.testnet");

		VMContext.setSigner_account_id(inputAccountId);
		setUserInfo(inputUsername);

		VMContext.setSigner_account_id("onboard2.testnet");
		expect(setUserInfo(inputUsername)).toBe(3);
		// TODO: call getUserInfo and ensure [accountId, publicKey] are not overwritten
	});
});
