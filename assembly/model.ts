/*
 * Copyright (c) 2021-2022 Capsule Social, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */
import { PersistentMap } from "near-sdk-as";

export const userLookup = new PersistentMap<string, Array<string>>("u");
export const accountLookup = new PersistentMap<string, string>("a");
export const onboardLookup = new PersistentMap<string, bool>("o");
export const userRequestLookup = new PersistentMap<string, Array<string>>("r");
export const blockList = new Set<string>();
blockList.add("root");
blockList.add("admin");
blockList.add("support");

export const bannedUsers = new PersistentMap<string, Array<string>>("b");
export const privateSub = new PersistentMap<string, bool>("s");