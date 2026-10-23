# Student Marks CRUD API

Run the project with:

```bash
npm run local
```

The server uses the PostgreSQL settings in `.env` and listens on `PORT` (or `3000` when it is unset). The `students` and `student_marks` tables are created automatically on first use. Deleting a student cascades to its marks.

## Student endpoints

| Method | Endpoint | Body |
| --- | --- | --- |
| POST | `/api/students` | `{ "name": "Asha Sharma", "email": "asha@example.com" }` |
| GET | `/api/students` | - |
| GET | `/api/students/:studentId` | - |
| PUT | `/api/students/:studentId` | `{ "name": "Asha Sharma", "email": "asha@example.com" }` |
| DELETE | `/api/students/:studentId` | - |

A successful create returns `201` with the student, for example:

```json
{ "id": "uuid", "name": "Asha Sharma", "email": "asha@example.com" }
```

## Mark endpoints

| Method | Endpoint | Body |
| --- | --- | --- |
| POST | `/api/marks` | `{ "studentId": "student-uuid", "subject": "Mathematics", "marks": 88 }` |
| GET | `/api/marks?studentId=...&subject=...` | - |
| GET | `/api/marks/:markId` | - |
| PUT | `/api/marks/:markId` | `{ "studentId": "student-uuid", "subject": "Mathematics", "marks": 92 }` |
| DELETE | `/api/marks/:markId` | - |
| GET | `/api/marks/averages/subjects` | - |

Subject averages return:

```json
{
  "data": [
    { "subject": "English", "averageMarks": 60, "totalRecords": 1 },
    { "subject": "Mathematics", "averageMarks": 80, "totalRecords": 3 }
  ]
}
```

Invalid input returns `400`, missing resources return `404`, and duplicate emails or student-subject marks return `409`.
