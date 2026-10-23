export interface Mark {
    id: string;
    studentId: string;
    subject: string;
    marks: number;
}

export interface CreateMarkInput {
    studentId: string;
    subject: string;
    marks: number;
}

export type UpdateMarkInput = CreateMarkInput;

export interface SubjectAverage {
    subject: string;
    averageMarks: number;
    totalRecords: number;
}
