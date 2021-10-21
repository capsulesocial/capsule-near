import { Context, storage } from "near-sdk-as";

export function setUserInfo(username: string): u8 {
	if (username.length < 3 || username.length > 18) {
		return 2;
	}

	const arr = new Array<string>(2);
	arr[0] = Context.sender;
	arr[1] = Context.senderPublicKey;

	const val = storage.get<Array<string>>(username);
	if (!val) {
		storage.set<Array<string>>(username, arr);
		return 1;
	}

	if (val[0] == username) {
		storage.set<Array<string>>(username, arr);
		return 1;
	}
	return 3;
}

export function getUserInfo(username: string): Array<string> | null {
	return storage.get<Array<string>>(username);
}
