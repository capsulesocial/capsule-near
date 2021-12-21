import { PersistentMap } from "near-sdk-as";

export const userLookup = new PersistentMap<string, Array<string>>("u");
export const accountLookup = new PersistentMap<string, string>("a");
export const onboardLookup = new PersistentMap<string, bool>("o");
