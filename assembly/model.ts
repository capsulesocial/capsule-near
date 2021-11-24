import { PersistentMap } from "near-sdk-as";

export const userLookup = new PersistentMap<string, Array<string>>("u");
export const accountLookup = new PersistentMap<string, string>("a");
export const privateSub = new PersistentMap<string, bool>("p");
