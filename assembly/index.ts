import { Context } from "near-sdk-as";
import { userLookup, accountLookup } from "./model";

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
