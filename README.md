# Student Marks API

Students and marks CRUD with JWT authentication, role/permission based authorisation, per-record ownership checks and basic API hardening.

```bash
npm install
cp .env.example .env        # then fill in DB_* and a JWT_SECRET of 32+ characters
npm run db:migrate          # idempotent; safe to run repeatedly (dev also auto-syncs via TypeORM)
npm run local               # build + start on PORT (default 3000)
npm test                    # vitest, no database needed (in-memory repositories)
npm run typecheck && npm run build
```

Environment variables (validated at boot, see `src/config/env.ts`): `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `PORT`, `PASS_PERCENTAGE`, `ACADEMIC_YEAR`, `JWT_SECRET` (min 32 chars), `CORS_ORIGINS` (comma separated full origins; `*` is rejected on purpose), `MARKS_RATE_LIMIT_MAX` (default 60 per user per 10 minutes).

## 1. Authentication

| Method | Endpoint | Body | Result |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | `{ "email", "password" }` (min 8 chars) | `201`, always role `user` (no school data visible) |
| POST | `/api/auth/login` | `{ "email", "password" }` | `200 { accessToken, tokenType: "Bearer", expiresIn: 900, user }` |

Send `Authorization: Bearer <accessToken>` on everything else. Access tokens last 15 minutes and carry only the user id. The **role is re-read from the database on every request**, so demoting or deleting an account takes effect immediately, not when the token expires. Passwords are stored as salted scrypt hashes and never leave the server.

The first admin has to be promoted in the database: `UPDATE users SET role = 'admin' WHERE email = '...';`

## 2. Roles and permissions

Code checks **permissions**, never role names (`src/config/permissions.ts` is the only file that knows role names). Role checks live in routes (`requirePermission`), ownership checks live in services (`AccessPolicy.canAccessStudent`).

| Permission | admin | teacher | student |
| --- | :-: | :-: | :-: |
| `students:read:own` | ✓ | - | ✓ |
| `students:read:class` | ✓ | ✓ | - |
| `students:read:any` | ✓ | - | - |
| `students:write:any` | ✓ | - | - |
| `marks:read:own` | ✓ | - | ✓ |
| `marks:read:class` | ✓ | ✓ | - |
| `marks:read:any` | ✓ | - | - |
| `marks:write:class` | ✓ | ✓ | - |
| `marks:write:any` | ✓ | - | - |
| `marks:averages:class` | ✓ | ✓ | - |
| `marks:averages:any` | ✓ | - | - |
| `admin:manage` | ✓ | - | - |

`user` and `moderator` hold no permissions. A teacher's "class" scope is the rows of `teacher_classes`; a student's "own" scope is `users.student_id`.

## 3. Endpoints

All responses under `/api/auth`, `/api/students`, `/api/marks` and `/api/admin` carry `Cache-Control: no-store`.

| Endpoint | admin | teacher (own classes) | student (self) |
| --- | --- | --- | --- |
| `GET /api/students` | all | filtered to own classes | filtered to self |
| `GET /api/students/:studentId` | ✓ | own classes | self |
| `POST` / `PUT` / `PATCH` / `DELETE /api/students[/:studentId]` | ✓ | 403 | 403 |
| `POST /api/students/:studentId/marks` `{ subject, marks }` | ✓ | own classes | 403 |
| `POST /api/marks` `{ studentId, subject, marks }` | ✓ | own classes | 403 |
| `GET /api/marks[?studentId=&subject=]` | all | filtered to own classes | filtered to self |
| `GET /api/marks/:markId` | ✓ | own classes | self |
| `PUT` / `PATCH` / `DELETE /api/marks/:markId` | ✓ | own classes | 403 |
| `GET /api/marks/averages[?className=&section=]` (alias `/averages/subjects`) | ✓ | own classes only | 403 |

Students carry `className` (`1`-`12`) and `section` (`A`-`Z`); both are required on create/update.

Admin only:

| Endpoint | Body | Errors |
| --- | --- | --- |
| `POST /api/admin/teacher-classes` | `{ teacherUserId, className, section }` | 400 not a teacher / invalid, 404 unknown user, 409 duplicate |
| `POST /api/admin/student-links` | `{ userId, studentId }` | 400 not a student account / invalid, 404 unknown user or student, 409 already linked |
| `PATCH /api/admin/users/:userId/role` | `{ role }` | 400 invalid role or own account, 404 unknown user |

`POST /api/students/:studentId/marks` is limited to `MARKS_RATE_LIMIT_MAX` requests per 10 minutes **per user** (keyed by user id, not IP, because a school shares one IP). Over the limit: `429 { "message": ... }` with `Retry-After`.

### Decisions

- **Lists filter, they do not return 403.** A teacher or student asking for "the students" is asking a question they are allowed to ask; the correct answer is "the ones you may see" (possibly none). A 403 would break every list screen for a legitimate caller and tell them nothing useful. Single-record and role-level checks still reject.
- **A single record outside your scope is `404`, everywhere.** `404 Student not found` / `404 Mark not found` is returned both for "does not exist" and "not yours", so ids cannot be probed to learn which students or marks exist (IDOR enumeration). Role-level denials (a student trying to write, a teacher trying to create a student) are `403`, and so is asking the averages endpoint for a class you do not teach, because there is no record whose existence needs hiding.

### Examples

```bash
# Teacher (Ms Rao) posts a mark for a student in her own class: 201
curl -X POST http://localhost:3000/api/students/$PRIYA_ID/marks \
  -H "Authorization: Bearer $RAO_TOKEN" -H "Content-Type: application/json" \
  -d '{"subject":"Maths","marks":92}'

# Student (Priya) lists students and gets only herself: 200 [ { "name": "Priya", ... } ]
curl http://localhost:3000/api/students -H "Authorization: Bearer $PRIYA_TOKEN"

# Teacher asks for averages of a class she does not teach: 403 {"message":"You do not teach the requested class"}
curl "http://localhost:3000/api/marks/averages?className=9" -H "Authorization: Bearer $RAO_TOKEN"
```

## 4. Layout

`src/config/permissions.ts` permission map · `src/module/access/` scope policy (`canAccessStudent`, list scopes, averages filter) and the repositories behind it · `src/middleware/` `authenticate`, `authorize` (`requirePermission`), `rateLimit` (`createRateLimiter`), `noStore` · `src/app.ts` wires repositories, services and routes (tests pass in-memory fakes) · `db/schema.sql` idempotent schema used by `npm run db:migrate`.
