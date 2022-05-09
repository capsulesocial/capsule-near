import { Context } from "near-sdk-as";
import {
	userLookup,
	accountLookup,
	onboardLookup,
	blockList,
	userRequestLookup,
	bannedUsers,
	privateSub,
} from "./model";

export function setUserInfo(username: string): u8 {
	// Switching over strings is not yet supported
	const uValid = validateUsername(username);
	switch (uValid) {
		// Username too short
		case 2:
		// Username already exists
		case 3:
		// Username too long
		case 4:
		// Username is blocklisted
		case 7:
		// Username contains invalid characters
		case 8:
			return uValid;
		// Valid username
		case 1:
		default:
			break;
	}

	const sender = Context.sender;
	if (accountLookup.get(sender)) {
		// accountId is already linked to a username
		return 5;
	}
	if (!onboardLookup.contains(sender)) {
		// accountId is not onboarded
		return 6;
	}

	const publicKey = Context.senderPublicKey;

	userLookup.set(username, [sender, publicKey]);
	accountLookup.set(sender, username);
	return 1;
}

export function getUserInfo(username: string): Array<string> | null {
	return userLookup.get(username);
}

export function getUsername(accountId: string): string | null {
	return accountLookup.get(accountId);
}

export function getAccountInfo(accountId: string): Array<string> | null {
	const username = getUsername(accountId);
	if (username) {
		return userLookup.get(username);
	}
	return null;
}

export function onboardAccount(accountId: string): u8 {
	const sender = Context.sender;
	if (sender != "capsule-alpha.testnet") {
		// non-admin accounts are not allowed to onboard
		return 0;
	}
	if (accountId.length < 2 || accountId.length > 64) {
		// accountId length outside the permissible range
		return 2;
	}
	if (onboardLookup.contains(accountId)) {
		// accountId is already onboarded
		return 3;
	}
	onboardLookup.set(accountId, true);
	return 1;
}

export function isAccountOnboarded(accountId: string): bool {
	return onboardLookup.contains(accountId);
}

export function usernameInRange(username: string): bool {
	const len = username.length;
	for (let i = 0; i < len; i++) {
		const charCode = username.charCodeAt(i);
		if (
			// Digits 0-9
			!(charCode >= 48 && charCode <= 57) &&
			// Lowercase characters a-z
			!(charCode >= 97 && charCode <= 122) &&
			// Underscore _ character
			charCode != 95
		) {
			return false;
		}
	}
	return true;
}

export function validateUsername(
	username: string,
	blistcheck: bool = true
): u8 {
	if (username.length < 3) {
		// Username too short
		return 2;
	}

	if (username.length > 18) {
		// Username too long
		return 4;
	}

	if (!usernameInRange(username)) {
		// Username contains invalid characters
		return 8;
	}

	if (blistcheck && (blockList.has(username) || username.includes("capsule"))) {
		// Username is blocklisted
		return 7;
	}

	const val = userLookup.get(username);
	if (val) {
		// Username already exists
		return 3;
	}

	return 1;
}

export function requestSetUserInfo(username: string): u8 {
	const uValid = validateUsername(username, false);
	switch (uValid) {
		// Username too short
		case 2:
		// Username already exists
		case 3:
		// Username too long
		case 4:
		// Username contains invalid characters
		case 8:
			return uValid;
		// Username is blocklisted
		case 7:
		// Valid username
		case 1:
		default:
			break;
	}

	const sender = Context.sender;
	const publicKey = Context.senderPublicKey;

	// accountId should not be associated with any existing username
	if (accountLookup.get(sender)) {
		return 5;
	}

	// To prevent spamming
	if (!onboardLookup.contains(sender)) {
		// accountId not onboarded
		return 6;
	}

	// Reject usernames that are not in the blocklist
	if (!blockList.has(username) && !username.includes("capsule")) {
		// Username is not blocklisted
		return 7;
	}

	const val = userRequestLookup.get(username);
	if (!val) {
		userRequestLookup.set(username, [sender, publicKey]);
		// Successful userInfo update
		return 1;
	}

	// Username already exists
	return 3;
}

export function verifySetUserInfo(username: string): u8 {
	const sender = Context.sender;
	if (sender != "capsule-alpha.testnet") {
		// Non-admin accounts are not allowed to verify
		return 0;
	}

	const val = userRequestLookup.get(username);
	if (!val) {
		// Username doesn't exist in the waiting list
		return 2;
	}
	userRequestLookup.delete(username);

	const accountId = val[0];

	if (accountLookup.get(accountId)) {
		// NEAR account already linked to another username
		return 5;
	}

	const val2 = userLookup.get(username);
	if (!val2) {
		userLookup.set(username, val);
		accountLookup.set(accountId, username);
		// Successful registration
		return 1;
	}

	// Username already exists
	return 3;
}

export function deactivateAccount(): bool {
	const sender = Context.sender;
	const blockOn = Context.blockTimestamp;

	const username = accountLookup.get(sender);
	// if (!username) {return;} doesn't work!

	if (username) {
		const userInfo = userLookup.get(username);
		if (userInfo) {
			// Compare storage / compute costs if radix is changed to 10
			const newList = userInfo.slice(0, 2).concat([blockOn.toString(16)]);
			userLookup.set(username, newList);
			return true;
		}
	}

	return false;
}

export function banAccount(
	username: string,
	classCode: u8,
	cid: string | null = null
): bool {
	const sender = Context.sender;
	const blockOn = Context.blockTimestamp.toString(16);
	const classStr = classCode.toString(10);

	if (sender != "capsuleblock-alpha.testnet") {
		return false;
	}

	if (bannedUsers.contains(username)) {
		return false;
	}

	switch (classCode) {
		// Content deemed illegal
		case 1:
		// Threats of violence
		case 2:
		// Pornography / sexually exploitative
		case 3:
		// Extremely gruesome / violent content
		case 4:
		// Non-consensually posting confidential personal info
		case 5:
		// Content that is a result of software error
		case 6:
		// Plagiarism / impersonation
		case 7:
		// Spam
		case 8:
			break;
		default:
			return false;
	}

	const banInfo = [blockOn, classStr];
	if (cid) {
		if (cid.length == 59) {
			banInfo.push(cid);
		} else {
			return false;
		}
	}

	const userInfo = userLookup.get(username);
	if (userInfo) {
		// Compare storage / compute costs if radix is changed to 10
		const newList = userInfo.slice(0, 2).concat([blockOn]);
		userLookup.set(username, newList);
		bannedUsers.set(username, banInfo);
		return true;
	}

	return false;
}

export function bannedAccountInfo(username: string): Array<string> | null {
	return bannedUsers.get(username);
}

export function setPrivateSub(username: string): u8 {
	const sender = Context.sender;
	if (sender != "capsule.testnet") {
		return 0;
	}
	if (!userLookup.contains(username)) {
		return 2;
	}
	privateSub.set(username, true);
	return 1;
}

export function hasPrivateSub(username: string): bool {
	return privateSub.contains(username);
}
