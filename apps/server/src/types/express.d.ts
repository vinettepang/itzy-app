/// <reference types="express" />

declare global {
  namespace Express {
    /** Set by JwtStrategy.validate — matches JwtPayload resolution */
    interface User {
      userId: string;
      email: string;
      role: string;
    }
  }
}

export {};
