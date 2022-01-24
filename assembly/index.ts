import { Context, logging } from "near-sdk-as";
import { userLookup, accountLookup, onboardLookup, blockList } from "./model";

export function setUserInfo(username: string): u8 {
	if (username.length < 3) {
		return 2;
	}

	if (username.length > 18) {
		return 4;
	}

	const sender = Context.sender;
	if (accountLookup.get(sender)) {
		return 5;
	}
	if (!onboardLookup.contains(sender)) {
		return 6;
	}

	if (blockList.has(username) || username.includes("capsule")) {
		return 7;
	}

	const publicKey = Context.senderPublicKey;

	const val = userLookup.get(username);
	if (!val) {
		userLookup.set(username, [sender, publicKey]);
		accountLookup.set(sender, username);
		return 1;
	}

	if (val[0] == sender) {
		userLookup.set(username, [sender, publicKey]);
		accountLookup.set(sender, username);
		return 1;
	}
	return 3;
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
