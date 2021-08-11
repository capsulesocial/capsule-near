import { Context, storage } from 'near-sdk-as'

export function getProfile(accountId: string): string | null {
	return storage.get<string>(accountId, 'Hello')
}

export function setProfile(cid: string): void {
	const accountId = Context.sender
	storage.set(accountId, cid)
}
