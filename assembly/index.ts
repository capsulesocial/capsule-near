import { Context, storage } from "near-sdk-as";

export function setUserInfo(username: string, pubkey: string): void {
	const arr = new Array<string>(2);
	arr[0] = Context.sender;
	arr[1] = pubkey;

	const val = storage.get<Array<string>>(username);
	if (!val) {
		storage.set<Array<string>>(username, arr);
		return;
	}

	if (val[0] == username) {
		storage.set<Array<string>>(username, arr);
	}
}

export function getUserInfo(username: string): Array<string> | null {
	return storage.get<Array<string>>(username);
}
