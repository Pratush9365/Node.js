export interface CreateMarkInput {
    studentId: string;
    subject: string;
    marks: number;
}

export type UpdateMarkInput = CreateMarkInput;

export interface MarkFilters {
    studentId?: string;
    subject?: string;
}

export interface SubjectAverage {
    subject: string;
    averageMarks: number;
    totalRecords: number;
}
