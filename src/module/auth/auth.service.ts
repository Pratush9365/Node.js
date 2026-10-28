import { ROLES } from "../../config/permissions.js";
import { AppError } from "../../errors/AppError.js";
import { getDatabaseErrorCode, PgErrorCode } from "../../errors/databaseError.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import type { IUserRepository, PublicUser } from "../user/interface/user.interface.js";
import { UserRepository } from "../user/user.repository.js";
import type { User } from "../user/user.entity.js";
import type { Credentials } from "./auth.dto.js";
import { ACCESS_TOKEN_TTL_SECONDS, TokenService } from "./token.service.js";

export interface LoginResult {
    accessToken: string;
    tokenType: "Bearer";
    expiresIn: number;
    user: PublicUser;
}

const INVALID_CREDENTIALS = "Invalid email or password";

export function toPublicUser(user: User): PublicUser {
    return { id: user.id, email: user.email, role: user.role, studentId: user.studentId ?? null };
}

export class AuthService {
    /** Verified against when the email is unknown, so "no such user" costs the same time as "wrong password". */
    private dummyHash: Promise<string> | undefined;

    /** The token service has no default on purpose: a signing secret must always be passed in explicitly. */
    public constructor(
        private readonly tokens: TokenService,
        private readonly users: IUserRepository = new UserRepository(),
    ) {}

    /** Public registration always creates the least-privileged role; elevating it is an admin action. */
    public async register(input: { email: string; password: string }): Promise<PublicUser> {
        const passwordHash = await hashPassword(input.password);
        try {
            const user = await this.users.create({ email: input.email, passwordHash, role: ROLES.USER });
            return toPublicUser(user);
        } catch (error: unknown) {
            if (getDatabaseErrorCode(error) === PgErrorCode.UNIQUE_VIOLATION) {
                throw AppError.conflict("An account with this email already exists");
            }
            throw error;
        }
    }

    public async login(credentials: Credentials): Promise<LoginResult> {
        const user = await this.users.findByEmailWithPassword(credentials.email);
        this.dummyHash ??= hashPassword("not-a-real-password");
        const valid = await verifyPassword(credentials.password, user?.passwordHash ?? (await this.dummyHash));
        if (!user || !valid) throw AppError.unauthorized(INVALID_CREDENTIALS);

        return {
            accessToken: this.tokens.sign(user.id),
            tokenType: "Bearer",
            expiresIn: ACCESS_TOKEN_TTL_SECONDS,
            user: toPublicUser(user),
        };
    }
}
