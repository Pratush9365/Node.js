import jwt from "jsonwebtoken";
import { AppError } from "../../errors/AppError.js";

/** Access tokens live for 15 minutes. There is no refresh token, so a leaked token is short-lived. */
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

const ALGORITHM = "HS256";

/**
 * Issues and verifies access tokens. The token carries only the user id (`sub`):
 * the role is deliberately NOT in it, so a role change or a deleted account takes effect immediately.
 */
export class TokenService {
    public constructor(private readonly secret: string) {}

    public sign(userId: string): string {
        return jwt.sign({}, this.secret, { algorithm: ALGORITHM, subject: userId, expiresIn: ACCESS_TOKEN_TTL_SECONDS });
    }

    /** Returns the user id, or throws a 401. Pinning the algorithm blocks `alg: none` and key-confusion tricks. */
    public verify(token: string): string {
        try {
            const payload = jwt.verify(token, this.secret, { algorithms: [ALGORITHM] });
            if (typeof payload === "object" && typeof payload.sub === "string") return payload.sub;
        } catch {
            // fall through: expired, malformed and wrongly signed tokens are all the same 401
        }
        throw AppError.unauthorized("Invalid or expired access token");
    }
}
