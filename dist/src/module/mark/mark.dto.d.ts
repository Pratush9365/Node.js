import type { AveragesQuery, CreateMarkInput, UpdateMarkInput } from "./mark.interface.js";
export declare class MarkDto {
    private static asObject;
    private static subjectAndMarks;
    private static validate;
    static create(body: unknown): CreateMarkInput;
    /** For POST /api/students/:studentId/marks: the student id is taken from the URL and any body value is ignored. */
    static createForStudent(studentId: string, body: unknown): CreateMarkInput;
    static update(body: unknown): UpdateMarkInput;
    static averagesQuery(query: Record<string, unknown>): AveragesQuery;
}
//# sourceMappingURL=mark.dto.d.ts.map