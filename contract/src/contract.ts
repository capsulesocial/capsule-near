import {
    NearBindgen,
    call,
    bytes,
    UnorderedMap,
    initialize,
    view,
} from "near-sdk-js";
import { predecessorAccountId, signerAccountPk } from "near-sdk-js/lib/api";
import { base58 } from "@scure/base";
import { bytesToU8Array } from "near-sdk-js/lib/utils";

const blockList = new Set(["root", "admin", "support"]);

@NearBindgen({})
class Blogchain {
    onboardLookup: UnorderedMap = new UnorderedMap("o");
    userLookup: UnorderedMap = new UnorderedMap("u");
    accountLookup: UnorderedMap = new UnorderedMap("a");

    @initialize({})
    init() {}

    @view({})
    getOnboardAccountId(): string {
        return "capsule-alpha.testnet";
    }

    @call({ payableFunction: true })
    setUserInfo({ username }: { username: string }): number {
        // Switching over strings is not yet supported
        const uValid = this.validateUsername(username);
        switch (uValid) {
            // Username too short
            case 2:
            // Username already exists
            case 3:
            // Username too long
            case 4:
            // Username is blocklisted
            case 7:
            // Username contains invalid characters
            case 8:
                return uValid;
            // Valid username
            case 1:
            default:
                break;
        }

        const sender = predecessorAccountId();
        if (this.accountLookup.get(sender)) {
            // accountId is already linked to a username
            return 5;
        }
        if (!this.onboardLookup.get(sender)) {
            // accountId is not onboarded
            return 6;
        }

        const publicKeyBytes = bytesToU8Array(signerAccountPk());

        this.userLookup.set(username, [sender, base58.encode(publicKeyBytes)]);
        this.accountLookup.set(sender, username);
        return 1;
    }

    @view({})
    getUserInfo({ username }: { username: string }): unknown | null {
        return this.userLookup.get(username);
    }

    @view({})
    getUsername({ accountId }: { accountId: string }): unknown | null {
        return this.accountLookup.get(accountId);
    }

    @call({ payableFunction: true })
    onboardAccount({ accountId }: { accountId: string }): number {
        const sender = predecessorAccountId();
        const onboardAccountId = this.getOnboardAccountId();
        const accountIdBytes = bytes(accountId);

        // if (sender !== onboardAccountId) {
        //     // non-admin accounts are not allowed to onboard
        //     return 0;
        // }

        if (accountId.length < 2 || accountId.length > 64) {
            // accountId length outside the permissible range
            return 2;
        }

        if (this.onboardLookup.get(accountIdBytes)) {
            // accountId is already onboarded
            return 3;
        }

        this.onboardLookup.set(accountIdBytes, true);
        return 1;
    }

    @view({})
    isAccountOnboarded({ accountId }: { accountId: string }): boolean {
        const accountIdBytes = bytes(accountId);
        if (!this.onboardLookup.get(accountIdBytes)) {
            return false;
        }
        return true;
    }

    @view({})
    usernameInRange({ username }: { username: string }): boolean {
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

    @view({})
    validateUsername(username: string, blistcheck: boolean = true): number {
        if (username.length < 3) {
            // Username too short
            return 2;
        }

        if (username.length > 18) {
            // Username too long
            return 4;
        }

        if (!this.usernameInRange({ username })) {
            // Username contains invalid characters
            return 8;
        }

        if (
            blistcheck &&
            (blockList.has(username) || username.includes("capsule"))
        ) {
            // Username is blocklisted
            return 7;
        }

        const val = this.userLookup.get(username);
        if (val) {
            // Username already exists
            return 3;
        }

        return 1;
    }
}
