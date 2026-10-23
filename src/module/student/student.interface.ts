export interface Student {
    id: string;
    name: string;
    email: string;
}

export interface CreateStudentInput {
    name: string;
    email: string;
}

export type UpdateStudentInput = CreateStudentInput;
