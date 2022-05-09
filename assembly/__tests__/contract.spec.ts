import { VMContext } from "near-sdk-as";
import {
	banAccount,
	deactivateAccount,
	onboardAccount,
	requestSetUserInfo,
	setUserInfo,
	verifySetUserInfo,
} from "..";
import {
	accountLookup,
	bannedUsers,
	onboardLookup,
	userLookup,
	userRequestLookup,
} from "../model";

const inputAccountId: string = "onboard.testnet";
const inputUsername: string = "testuser";

const blistedAccountId: string = "onboard.testnet";
const blistedUserOne: string = "root";
const blistedUserTwo: string = "admin";
const blistedUserThree: string = "support";
const blistedUserCapsule: string = "capsuleoff";

function getAdminAccount(): string {
	return "capsule.testnet";
}

function getBanAdminAccount(): string {
	return "capsuleblock.testnet";
}

describe("onboard test", () => {
	afterEach(() => {
		onboardLookup.delete(inputAccountId);
	});

	it("should return an error: only admin accounts allowed to onboard", () => {
		VMContext.setSigner_account_id("test.testnet");
		expect(onboardAccount(inputAccountId)).toBe(0);
		expect(onboardLookup.contains(inputAccountId)).toBe(false);
	});

	it("should onboard a user succesfully", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		expect(onboardAccount(inputAccountId)).toBe(1);
		expect(onboardLookup.contains(inputAccountId)).toBe(true);
	});

	it("should return an error: accountId too small", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		expect(onboardAccount("a")).toBe(2);
		expect(onboardLookup.contains("a")).toBe(false);
	});

	it("should return an error: accountId too long", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		const longAccId =
			"abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklm";
		expect(onboardAccount(longAccId)).toBe(2);
		expect(onboardLookup.contains(longAccId)).toBe(false);
	});

	it("should return an error: accountId already onboarded", () => {
		VMContext.setSigner_account_id(getAdminAccount());
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

	it("should return an error: username is too small", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(inputAccountId);

		VMContext.setSigner_account_id(inputAccountId);
		expect(setUserInfo("ab")).toBe(2);
		expect(accountLookup.contains(inputAccountId)).toBe(false);
		expect(userLookup.contains("ab")).toBe(false);
	});

	it("should return an error: username is too long", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(inputAccountId);

		VMContext.setSigner_account_id(inputAccountId);
		expect(setUserInfo("abcdefghijklmnopqrs")).toBe(4);
		expect(accountLookup.contains(inputAccountId)).toBe(false);
		expect(userLookup.contains("abcdefghijklmnopqrs")).toBe(false);
	});

	it("should return an error: cannot register with 'root' as username", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(inputAccountId);

		VMContext.setSigner_account_id(inputAccountId);

		expect(setUserInfo("root")).toBe(7);
		expect(accountLookup.contains(inputAccountId)).toBe(false);
		expect(userLookup.contains("root")).toBe(false);

		// TODO: check "capsule" and any username that contains "capsule"
	});

	it("should return an error: cannot register with 'support' as username", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(inputAccountId);

		VMContext.setSigner_account_id(inputAccountId);
		expect(setUserInfo("support")).toBe(7);
		expect(accountLookup.contains(inputAccountId)).toBe(false);
		expect(userLookup.contains("support")).toBe(false);
	});

	it("should return an error: cannot register with 'admin' as username", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(inputAccountId);

		VMContext.setSigner_account_id(inputAccountId);
		expect(setUserInfo("admin")).toBe(7);
		expect(accountLookup.contains(inputAccountId)).toBe(false);
		expect(userLookup.contains("admin")).toBe(false);
	});

	it("should return an error: username cannot contain uppercase characters", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(inputAccountId);

		VMContext.setSigner_account_id(inputAccountId);

		expect(setUserInfo("rooT")).toBe(8);
		expect(accountLookup.contains(inputAccountId)).toBe(false);
		expect(userLookup.contains("rooT")).toBe(false);

		// TODO: more comprehensive tests for identifying invalid chars in usernames
		// TODO: Separate tests for usernameInRange
	});

	it("should return an error: username cannot contain dots", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(inputAccountId);

		VMContext.setSigner_account_id(inputAccountId);
		expect(setUserInfo("suppor.")).toBe(8);
		expect(accountLookup.contains(inputAccountId)).toBe(false);
		expect(userLookup.contains("suppor.")).toBe(false);
	});

	it("should register a username succesfully", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(inputAccountId);

		VMContext.setSigner_account_id(inputAccountId);

		expect(setUserInfo(inputUsername)).toBe(1);
		expect(userLookup.contains(inputUsername)).toBe(true);
		const result = userLookup.get(inputUsername);
		expect(result).not.toBeNull();
		if (result) {
			expect(result[0]).toBe(inputAccountId);
		}
		expect(accountLookup.contains(inputAccountId)).toBe(true);
	});

	it("should return an error: accountId linked to another username", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(inputAccountId);

		VMContext.setSigner_account_id(inputAccountId);
		setUserInfo(inputUsername);

		expect(setUserInfo("dupuser")).toBe(5);
		expect(userLookup.contains("dupuser")).toBe(false);
	});

	it("should return an error: cannot update userInfo once registered", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(inputAccountId);

		VMContext.setSigner_account_id(inputAccountId);
		setUserInfo(inputUsername);

		expect(setUserInfo(inputUsername)).toBe(3);
	});

	it("should return an error: username taken by another accountId", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(inputAccountId);
		onboardAccount("onboard2.testnet");

		VMContext.setSigner_account_id(inputAccountId);
		setUserInfo(inputUsername);

		VMContext.setSigner_account_id("onboard2.testnet");
		expect(setUserInfo(inputUsername)).toBe(3);

		expect(userLookup.contains(inputUsername)).toBe(true);
		const result = userLookup.get(inputUsername);
		if (result) {
			expect(result[0]).toBe(inputAccountId);
		}
	});
});

describe("testing registration of blocklisted usernames", () => {
	afterEach(() => {
		onboardLookup.delete(blistedAccountId);
		onboardLookup.delete("onboard2.testnet");

		accountLookup.delete(blistedAccountId);

		userRequestLookup.delete(inputUsername);
		userRequestLookup.delete(blistedUserCapsule);
		userRequestLookup.delete(blistedUserOne);
		userRequestLookup.delete(blistedUserTwo);
		userRequestLookup.delete(blistedUserThree);

		userLookup.delete(inputUsername);
		userLookup.delete(blistedUserCapsule);
		userLookup.delete(blistedUserOne);
		userLookup.delete(blistedUserTwo);
		userLookup.delete(blistedUserThree);
	});

	it("should return an error: accountId not onboarded", () => {
		VMContext.setSigner_account_id(blistedAccountId);
		expect(requestSetUserInfo(blistedUserOne)).toBe(6);

		expect(userRequestLookup.contains(blistedUserOne)).toBe(false);
		expect(userLookup.contains(blistedUserOne)).toBe(false);
		expect(accountLookup.contains(blistedAccountId)).toBe(false);
	});

	it("should return an error: username is too small", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(blistedAccountId);

		VMContext.setSigner_account_id(blistedAccountId);
		expect(requestSetUserInfo("ab")).toBe(2);

		expect(userRequestLookup.contains("ab")).toBe(false);
		expect(accountLookup.contains(blistedAccountId)).toBe(false);
		expect(userLookup.contains("ab")).toBe(false);
	});

	it("should return an error: username is too long", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(blistedAccountId);

		VMContext.setSigner_account_id(blistedAccountId);
		expect(requestSetUserInfo("abcdefghijklmnopqrs")).toBe(4);

		expect(userRequestLookup.contains("abcdefghijklmnopqrs")).toBe(false);
		expect(accountLookup.contains(blistedAccountId)).toBe(false);
		expect(userLookup.contains("abcdefghijklmnopqrs")).toBe(false);
	});

	it("should return an error: username cannot contain uppercase characters", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(blistedAccountId);

		VMContext.setSigner_account_id(blistedAccountId);
		expect(requestSetUserInfo("tesT")).toBe(8);

		expect(userRequestLookup.contains("tesT")).toBe(false);
		expect(accountLookup.contains(blistedAccountId)).toBe(false);
		expect(userLookup.contains("tesT")).toBe(false);
	});

	it("should return an error: username cannot contain dots", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(blistedAccountId);

		VMContext.setSigner_account_id(blistedAccountId);
		expect(requestSetUserInfo("tes.")).toBe(8);

		expect(userRequestLookup.contains("tes.")).toBe(false);
		expect(accountLookup.contains(blistedAccountId)).toBe(false);
		expect(userLookup.contains("tes.")).toBe(false);
	});

	it("should return an error: username is not blocklisted", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(blistedAccountId);

		VMContext.setSigner_account_id(blistedAccountId);
		expect(requestSetUserInfo(inputUsername)).toBe(7);

		expect(userRequestLookup.contains(inputUsername)).toBe(false);
		expect(accountLookup.contains(blistedAccountId)).toBe(false);
		expect(userLookup.contains(inputUsername)).toBe(false);
	});

	it("should return an error: accountId linked to another registered username", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(blistedAccountId);

		VMContext.setSigner_account_id(blistedAccountId);
		setUserInfo(inputUsername);

		expect(requestSetUserInfo(blistedUserOne)).toBe(5);
	});

	it("should successfully add 'root' to waiting list", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(blistedAccountId);

		VMContext.setSigner_account_id(blistedAccountId);
		expect(requestSetUserInfo(blistedUserOne)).toBe(1);

		expect(userRequestLookup.contains(blistedUserOne)).toBe(true);
		const result = userRequestLookup.get(blistedUserOne);
		if (result) {
			expect(result[0]).toBe(blistedAccountId);
		}
		expect(userLookup.contains(blistedUserOne)).toBe(false);
		expect(accountLookup.contains(blistedAccountId)).toBe(false);
	});

	it("should successfully add 'admin' to waiting list", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(blistedAccountId);

		VMContext.setSigner_account_id(blistedAccountId);
		expect(requestSetUserInfo(blistedUserTwo)).toBe(1);

		expect(userRequestLookup.contains(blistedUserTwo)).toBe(true);
		const result = userRequestLookup.get(blistedUserOne);
		if (result) {
			expect(result[0]).toBe(blistedAccountId);
		}
		expect(userLookup.contains(blistedUserTwo)).toBe(false);
		expect(accountLookup.contains(blistedAccountId)).toBe(false);
	});

	it("should successfully add 'support' to waiting list", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(blistedAccountId);

		VMContext.setSigner_account_id(blistedAccountId);
		expect(requestSetUserInfo(blistedUserThree)).toBe(1);

		expect(userRequestLookup.contains(blistedUserThree)).toBe(true);
		const result = userRequestLookup.get(blistedUserOne);
		if (result) {
			expect(result[0]).toBe(blistedAccountId);
		}
		expect(userLookup.contains(blistedUserThree)).toBe(false);
		expect(accountLookup.contains(blistedAccountId)).toBe(false);
	});

	it("should successfully add 'capsuleoff' to waiting list", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(blistedAccountId);

		VMContext.setSigner_account_id(blistedAccountId);
		expect(requestSetUserInfo(blistedUserCapsule)).toBe(1);

		expect(userRequestLookup.contains(blistedUserCapsule)).toBe(true);
		const result = userRequestLookup.get(blistedUserOne);
		if (result) {
			expect(result[0]).toBe(blistedAccountId);
		}
		expect(userLookup.contains(blistedUserCapsule)).toBe(false);
		expect(accountLookup.contains(blistedAccountId)).toBe(false);
	});

	it("should add two usernames to waiting list with same accountId", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(blistedAccountId);

		VMContext.setSigner_account_id(blistedAccountId);
		requestSetUserInfo(blistedUserOne);

		expect(requestSetUserInfo(blistedUserTwo)).toBe(1);
		expect(userRequestLookup.contains(blistedUserTwo)).toBe(true);
		const result = userRequestLookup.get(blistedUserTwo);
		if (result) {
			expect(result[0]).toBe(blistedAccountId);
		}
	});

	it("should return an error: username is already in waiting list", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(blistedAccountId);
		onboardAccount("onboard2.testnet");

		VMContext.setSigner_account_id(blistedAccountId);
		requestSetUserInfo(blistedUserOne);

		VMContext.setSigner_account_id("onboard2.testnet");
		expect(requestSetUserInfo(blistedUserOne)).toBe(3);
		expect(userRequestLookup.contains(blistedUserOne)).toBe(true);
		const result = userRequestLookup.get(blistedUserOne);
		if (result) {
			expect(result[0]).toBe(blistedAccountId);
		}
	});

	it("[verify] should return an error: only admin accounts allowed to verify", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(blistedAccountId);

		VMContext.setSigner_account_id(blistedAccountId);
		requestSetUserInfo(blistedUserOne);

		expect(verifySetUserInfo(blistedUserOne)).toBe(0);

		expect(userRequestLookup.contains(blistedUserOne)).toBe(true);
		expect(userLookup.contains(blistedUserOne)).toBe(false);
		expect(accountLookup.contains(blistedAccountId)).toBe(false);
	});

	it("[verify] should return an error: username not in waiting list", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		expect(verifySetUserInfo(blistedUserOne)).toBe(2);

		expect(userRequestLookup.contains(blistedUserOne)).toBe(false);
		expect(userLookup.contains(blistedUserOne)).toBe(false);
		expect(accountLookup.contains(blistedAccountId)).toBe(false);
	});

	it("[verify] should register a blocklisted username", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(blistedAccountId);

		VMContext.setSigner_account_id(blistedAccountId);
		requestSetUserInfo(blistedUserOne);

		expect(userRequestLookup.contains(blistedUserOne)).toBe(true);
		const userRequestInfo = userRequestLookup.get(blistedUserOne);

		VMContext.setSigner_account_id(getAdminAccount());
		expect(verifySetUserInfo(blistedUserOne)).toBe(1);

		expect(userRequestLookup.contains(blistedUserOne)).toBe(false);

		expect(userLookup.contains(blistedUserOne)).toBe(true);
		const userInfo = userLookup.get(blistedUserOne);

		expect(accountLookup.contains(blistedAccountId)).toBe(true);
		expect(accountLookup.get(blistedAccountId)).toBe(blistedUserOne);

		// Always true
		if (userInfo && userRequestInfo) {
			expect(userInfo[0]).toBe(userRequestInfo[0]);
			expect(userInfo[1]).toBe(userRequestInfo[1]);
		}
	});

	it("[verify] should return an error: accountId already linked to another username", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(blistedAccountId);

		VMContext.setSigner_account_id(blistedAccountId);
		requestSetUserInfo(blistedUserOne);
		requestSetUserInfo(blistedUserTwo);

		VMContext.setSigner_account_id(getAdminAccount());
		verifySetUserInfo(blistedUserOne);
		expect(verifySetUserInfo(blistedUserTwo)).toBe(5);

		expect(userLookup.contains(blistedUserTwo)).toBe(false);
		expect(userRequestLookup.contains(blistedUserTwo)).toBe(false);
		expect(userLookup.contains(blistedUserOne)).toBe(true);
	});

	it("should return an error: username is already a registered user", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(blistedAccountId);
		onboardAccount("onboard2.testnet");

		VMContext.setSigner_account_id(blistedAccountId);
		requestSetUserInfo(blistedUserOne);
		VMContext.setSigner_account_id(getAdminAccount());
		verifySetUserInfo(blistedUserOne);

		VMContext.setSigner_account_id("onboard2.testnet");
		expect(requestSetUserInfo(blistedUserOne)).toBe(3);
		expect(userRequestLookup.contains(blistedUserOne)).toBe(false);
	});
});

describe("deactivate account", () => {
	afterEach(() => {
		onboardLookup.delete(inputAccountId);
		accountLookup.delete(inputAccountId);
		userLookup.delete(inputUsername);
	});

	it("should return an error: accountId not linked to any username", () => {
		VMContext.setSigner_account_id(inputAccountId);
		expect(deactivateAccount()).toBe(false);
	});

	it("should successfully deactivate an account", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(inputAccountId);

		VMContext.setSigner_account_id(inputAccountId);
		setUserInfo(inputUsername);

		expect(userLookup.contains(inputUsername)).toBe(true);
		const userInfo = userLookup.get(inputUsername);
		// Always true
		if (userInfo) {
			expect(userInfo.length).toBe(2);
		}

		expect(deactivateAccount()).toBe(true);
		const userInfoUpdated = userLookup.get(inputUsername);
		expect(userInfoUpdated).not.toBeNull();
		// Always true
		if (userInfoUpdated) {
			expect(userInfoUpdated.length).toBe(3);
		}

		// Always true
		if (userInfo && userInfoUpdated) {
			expect(userInfo[0]).toBe(userInfoUpdated[0]);
			expect(userInfo[1]).toBe(userInfoUpdated[1]);
		}
	});

	it("should update timestamp correctly if updated more than once", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(inputAccountId);

		VMContext.setSigner_account_id(inputAccountId);
		setUserInfo(inputUsername);

		deactivateAccount();

		expect(deactivateAccount()).toBe(true);
		const userInfoUpdated = userLookup.get(inputUsername);
		expect(userInfoUpdated).not.toBeNull();
		// Always true
		if (userInfoUpdated) {
			expect(userInfoUpdated.length).toBe(3);
		}
	});
});

describe("ban accounts", () => {
	afterEach(() => {
		onboardLookup.delete(inputAccountId);
		accountLookup.delete(inputAccountId);
		userLookup.delete(inputUsername);
		bannedUsers.delete(inputUsername);
	});

	it("should return an error: insufficient permissions", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(inputAccountId);

		VMContext.setSigner_account_id(inputAccountId);
		setUserInfo(inputUsername);

		expect(userLookup.contains(inputUsername)).toBe(true);
		const userInfo = userLookup.get(inputUsername);
		// Always true
		if (userInfo) {
			expect(userInfo.length).toBe(2);
		}

		VMContext.setSigner_account_id(getAdminAccount());
		expect(banAccount(inputUsername, 1)).toBe(false);
		const userInfoUpdated = userLookup.get(inputUsername);
		expect(userInfoUpdated).not.toBeNull();
		// Always true
		if (userInfoUpdated) {
			expect(userInfoUpdated.length).toBe(2);
		}

		// Always true
		if (userInfo && userInfoUpdated) {
			expect(userInfo[0]).toBe(userInfoUpdated[0]);
			expect(userInfo[1]).toBe(userInfoUpdated[1]);
		}
		expect(bannedUsers.contains(inputUsername)).toBe(false);
	});

	it("should return an error: invalid classification code", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(inputAccountId);

		VMContext.setSigner_account_id(inputAccountId);
		setUserInfo(inputUsername);

		expect(userLookup.contains(inputUsername)).toBe(true);
		const userInfo = userLookup.get(inputUsername);
		// Always true
		if (userInfo) {
			expect(userInfo.length).toBe(2);
		}

		VMContext.setSigner_account_id(getBanAdminAccount());
		expect(banAccount(inputUsername, 9)).toBe(false);
		const userInfoUpdated = userLookup.get(inputUsername);
		expect(userInfoUpdated).not.toBeNull();
		// Always true
		if (userInfoUpdated) {
			expect(userInfoUpdated.length).toBe(2);
		}

		// Always true
		if (userInfo && userInfoUpdated) {
			expect(userInfo[0]).toBe(userInfoUpdated[0]);
			expect(userInfo[1]).toBe(userInfoUpdated[1]);
		}
		expect(bannedUsers.contains(inputUsername)).toBe(false);
	});

	it("should return an error: cid of invalid length", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(inputAccountId);

		VMContext.setSigner_account_id(inputAccountId);
		setUserInfo(inputUsername);

		const banClassCode: u8 = 1;
		const banCid =
			"bagaaierasords4njcts6vs7qvdjfcvgnume4hqohf65zsfguprqphs3icwea";

		expect(userLookup.contains(inputUsername)).toBe(true);
		const userInfo = userLookup.get(inputUsername);
		// Always true
		if (userInfo) {
			expect(userInfo.length).toBe(2);
		}

		VMContext.setSigner_account_id(getBanAdminAccount());
		expect(banAccount(inputUsername, banClassCode, banCid)).toBe(false);
		const userInfoUpdated = userLookup.get(inputUsername);
		expect(userInfoUpdated).not.toBeNull();
		// Always true
		if (userInfoUpdated) {
			expect(userInfoUpdated.length).toBe(2);
		}

		// Always true
		if (userInfo && userInfoUpdated) {
			expect(userInfo[0]).toBe(userInfoUpdated[0]);
			expect(userInfo[1]).toBe(userInfoUpdated[1]);
		}
		expect(bannedUsers.contains(inputUsername)).toBe(false);
	});

	it("should successfully ban an account", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(inputAccountId);

		VMContext.setSigner_account_id(inputAccountId);
		setUserInfo(inputUsername);

		const banClassCode: u8 = 1;

		expect(userLookup.contains(inputUsername)).toBe(true);
		const userInfo = userLookup.get(inputUsername);
		// Always true
		if (userInfo) {
			expect(userInfo.length).toBe(2);
		}

		VMContext.setSigner_account_id(getBanAdminAccount());
		expect(banAccount(inputUsername, banClassCode)).toBe(true);
		const userInfoUpdated = userLookup.get(inputUsername);
		expect(userInfoUpdated).not.toBeNull();
		// Always true
		if (userInfoUpdated) {
			expect(userInfoUpdated.length).toBe(3);
		}

		// Always true
		if (userInfo && userInfoUpdated) {
			expect(userInfo[0]).toBe(userInfoUpdated[0]);
			expect(userInfo[1]).toBe(userInfoUpdated[1]);
		}

		const banInfo = bannedUsers.get(inputUsername);
		expect(banInfo).not.toBeNull();
		if (banInfo) {
			expect(banInfo.length).toBe(2);
			expect(banInfo[1]).toBe(banClassCode.toString(10));
		}
	});

	it("should return an error: cannot ban an already banned account", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(inputAccountId);

		VMContext.setSigner_account_id(inputAccountId);
		setUserInfo(inputUsername);

		const banClassCode: u8 = 1;

		VMContext.setSigner_account_id(getBanAdminAccount());
		expect(banAccount(inputUsername, banClassCode)).toBe(true);

		const banInfo = bannedUsers.get(inputUsername);
		expect(banInfo).not.toBeNull();
		if (banInfo) {
			expect(banInfo.length).toBe(2);
			expect(banInfo[1]).toBe(banClassCode.toString(10));
		}

		expect(banAccount(inputUsername, banClassCode)).toBe(false);

		const banInfoUpdated = bannedUsers.get(inputUsername);
		expect(banInfoUpdated).not.toBeNull();
		if (banInfoUpdated && banInfo) {
			expect(banInfoUpdated.length).toBe(2);
			expect(banInfoUpdated[0]).toBe(banInfo[0]);
			expect(banInfoUpdated[1]).toBe(banInfo[1]);
		}
	});

	it("should successfully ban an account with cid of delistable content", () => {
		VMContext.setSigner_account_id(getAdminAccount());
		onboardAccount(inputAccountId);

		VMContext.setSigner_account_id(inputAccountId);
		setUserInfo(inputUsername);

		const banClassCode: u8 = 1;
		const banCid =
			"bafyreigsh6jibw5a6ihiegoldaxop4vlau4r4w6dv3oruvbub65a3h42mq";

		expect(userLookup.contains(inputUsername)).toBe(true);
		const userInfo = userLookup.get(inputUsername);
		// Always true
		if (userInfo) {
			expect(userInfo.length).toBe(2);
		}

		VMContext.setSigner_account_id(getBanAdminAccount());
		expect(banAccount(inputUsername, banClassCode, banCid)).toBe(true);
		const userInfoUpdated = userLookup.get(inputUsername);
		expect(userInfoUpdated).not.toBeNull();
		// Always true
		if (userInfoUpdated) {
			expect(userInfoUpdated.length).toBe(3);
		}

		// Always true
		if (userInfo && userInfoUpdated) {
			expect(userInfo[0]).toBe(userInfoUpdated[0]);
			expect(userInfo[1]).toBe(userInfoUpdated[1]);
		}

		const banInfo = bannedUsers.get(inputUsername);
		expect(banInfo).not.toBeNull();
		if (banInfo) {
			expect(banInfo.length).toBe(3);
			expect(banInfo[1]).toBe(banClassCode.toString(10));
			expect(banInfo[2]).toBe(banCid);
		}
	});
});
