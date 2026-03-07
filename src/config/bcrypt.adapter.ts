import { compare, genSalt, hash } from 'bcrypt';

// Switched to async to avoid blocking the server

export const bcryptAdapter = {
    hash: async (password: string): Promise<string> => {
        const salt = await genSalt(10);
        return hash(password, salt);
    },

    compare: async (password: string, hashValue: string): Promise<boolean> => {
        return compare(password, hashValue);
    }
}