import { PersistentMap } from "near-sdk-as";

export const userLookup = new PersistentMap<string, Array<string>>("u");
export const accountLookup = new PersistentMap<string, string>("a");
export const onboardLookup = new PersistentMap<string, bool>("o");
export const userRequestLookup = new PersistentMap<string, Array<string>>("r");
export const blockList = new Set<string>();
blockList.add("root");
blockList.add("admin");
blockList.add("support");

export const bannedUsers = new PersistentMap<string, bool>("b");
