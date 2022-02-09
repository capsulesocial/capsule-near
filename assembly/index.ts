import { Context } from "near-sdk-as";
import {
	userLookup,
	accountLookup,
	onboardLookup,
	blockList,
	userRequestLookup,
} from "./model";

export function setUserInfo(username: string): u8 {
	// Switching over strings is not yet supported
	const uValid = validateUsername(username);
	switch (uValid) {
		case 2:
		case 3:
		case 4:
		case 7:
		case 8:
			return uValid;
		case 1:
		default:
			break;
	}

	const sender = Context.sender;
	if (accountLookup.get(sender)) {
		return 5;
	}
	if (!onboardLookup.contains(sender)) {
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
	if (sender != "capsule.testnet") {
		return 0;
	}
	if (accountId.length < 2 || accountId.length > 64) {
		return 2;
	}
	if (onboardLookup.contains(accountId)) {
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
		return 2;
	}

	if (username.length > 18) {
		return 4;
	}

	if (!usernameInRange(username)) {
		return 8;
	}

	if (blistcheck && (blockList.has(username) || username.includes("capsule"))) {
		return 7;
	}

	const val = userLookup.get(username);
	if (val) {
		return 3;
	}

	return 1;
}

export function requestSetUserInfo(username: string): u8 {
	const uValid = validateUsername(username, false);
	switch (uValid) {
		case 2:
		case 3:
		case 4:
		case 8:
			return uValid;
		case 7:
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
		return 6;
	}

	// Reject usernames that are not in the blocklist
	if (!blockList.has(username) && !username.includes("capsule")) {
		return 7;
	}

	const val = userRequestLookup.get(username);
	if (!val) {
		userRequestLookup.set(username, [sender, publicKey]);
		return 1;
	}

	return 3;
}

export function verifySetUserInfo(username: string): u8 {
	const sender = Context.sender;
	if (sender != "capsule.testnet") {
		return 0;
	}

	const val = userRequestLookup.get(username);
	if (!val) {
		return 2;
	}
	userRequestLookup.delete(username);

	const accountId = val[0];

	if (accountLookup.get(accountId)) {
		return 5;
	}

	const val2 = userLookup.get(username);
	if (!val2) {
		userLookup.set(username, val);
		accountLookup.set(accountId, username);
		return 1;
	}

	return 3;
}
