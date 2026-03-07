import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { envs } from './envs';

//? Se coloca de esta forma para informar que es una dependencia
//! No deberia ser asi lo mejor seria hacer Dependency Injection en el constructor 
const JWT_SEED =  envs.JWT_SECRET

export class JwtAdapter {

    // DI
    // constructor() {}

    static async generateToken(payload: object | string, duration: StringValue | number = '2h'): Promise<string | undefined> {
        return new Promise((resolve, reject) => {
            jwt.sign(payload, JWT_SEED, {expiresIn: duration}, (err, token) => {
                if (err) {
                    console.error(`JWT signing error: ${err}`);
                    reject(err);
                }
                resolve(token);
            });
        });
    }

    static async verifyToken<T>(token: string): Promise<T | null> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, JWT_SEED, (err, decoded) => {
                if (err) {
                    console.error(`JWT verification error: ${err}`);
                    reject(err);
                }
                resolve(decoded as T);
            });
        });
    }
}