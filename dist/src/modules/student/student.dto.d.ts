import { z } from "zod";
export declare class StudentDto {
    static readonly createSchema: z.ZodObject<{
        rollNo: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
        firstName: z.ZodString;
        lastName: z.ZodString;
        dateOfBirth: z.ZodString;
        className: z.ZodPipe<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>, z.ZodEnum<{
            1: "1";
            10: "10";
            11: "11";
            12: "12";
            2: "2";
            3: "3";
            4: "4";
            5: "5";
            6: "6";
            7: "7";
            8: "8";
            9: "9";
        }>>;
        section: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
        guardian: z.ZodObject<{
            name: z.ZodString;
            phone: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
            relation: z.ZodPipe<z.ZodUnion<[z.ZodEnum<{
                father: "father";
                guardian: "guardian";
                mother: "mother";
            }>, z.ZodString]>, z.ZodTransform<"father" | "guardian" | "mother", string>>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    static readonly updateSchema: z.ZodObject<{
        rollNo: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
        firstName: z.ZodOptional<z.ZodString>;
        lastName: z.ZodOptional<z.ZodString>;
        dateOfBirth: z.ZodOptional<z.ZodString>;
        className: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, z.ZodTransform<string, string | number>>, z.ZodEnum<{
            1: "1";
            10: "10";
            11: "11";
            12: "12";
            2: "2";
            3: "3";
            4: "4";
            5: "5";
            6: "6";
            7: "7";
            8: "8";
            9: "9";
        }>>>;
        section: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
        guardian: z.ZodOptional<z.ZodObject<{
            name: z.ZodString;
            phone: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
            relation: z.ZodPipe<z.ZodUnion<[z.ZodEnum<{
                father: "father";
                guardian: "guardian";
                mother: "mother";
            }>, z.ZodString]>, z.ZodTransform<"father" | "guardian" | "mother", string>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    static toResponse(student: import("./student.interface.js").Student): {
        id: number;
        rollNo: string;
        firstName: string;
        lastName: string;
        className: string;
        section: string;
        guardian: import("./student.interface.js").Guardian;
        dateOfBirth: string;
        createdAt: string;
        updatedAt: string;
    };
}
export type CreateStudentDto = z.infer<typeof StudentDto.createSchema>;
export type UpdateStudentDto = z.infer<typeof StudentDto.updateSchema>;
//# sourceMappingURL=student.dto.d.ts.map