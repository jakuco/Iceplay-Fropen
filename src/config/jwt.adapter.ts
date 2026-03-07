import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { envs } from './envs';

//? Se coloca de esta forma para informar que es una dependencia
//! No deberia ser asi lo mejor seria hacer Dependency Injection en el constructor 
const JWT_SEED =  envs.JWT_SECRET


export class JwtAdapter {

    // DI
    // constructor() {}

    static generateToken(payload: object | string, duration: StringValue | number = '2h'): string | null {
        try {
            return jwt.sign(payload, JWT_SEED, {expiresIn: duration});
        } catch (err) {
            console.error(`JWT signing error: ${err}`);
            return null;
        }
    }

    static verifyToken<T>(token: string): T | null {
        try {
            return jwt.verify(token, JWT_SEED) as T;
        } catch (err) {
            console.error(`JWT verification error: ${err}`);
            return null;
        }
    }
}