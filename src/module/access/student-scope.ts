import { Brackets } from "typeorm";
import type { ObjectLiteral, SelectQueryBuilder } from "typeorm";
import type { AveragesFilter, ClassSection, StudentScope } from "./access.interface.js";

/** (class = a AND section = b) OR (...); an empty list matches nothing. */
function classCondition(classes: ClassSection[], alias: string): Brackets {
    return new Brackets((qb) => {
        if (classes.length === 0) {
            qb.where("1 = 0");
            return;
        }
        classes.forEach((classSection, index) => {
            qb.orWhere(`(${alias}.className = :scopeClass${index} AND ${alias}.section = :scopeSection${index})`, {
                [`scopeClass${index}`]: classSection.className,
                [`scopeSection${index}`]: classSection.section,
            });
        });
    });
}

/** Narrows a query that already joins the students table as `studentAlias` to what `scope` allows. */
export function applyStudentScope<T extends ObjectLiteral>(
    query: SelectQueryBuilder<T>,
    studentAlias: string,
    scope: StudentScope,
): SelectQueryBuilder<T> {
    switch (scope.kind) {
        case "all":
            return query;
        case "classes":
            return query.andWhere(classCondition(scope.classes, studentAlias));
        case "self":
            return query.andWhere(`${studentAlias}.id = :scopeStudentId`, { scopeStudentId: scope.studentId });
        case "none":
            return query.andWhere("1 = 0");
    }
}

/** Applies the optional class / section filters of the averages endpoint. */
export function applyAveragesFilter<T extends ObjectLiteral>(
    query: SelectQueryBuilder<T>,
    studentAlias: string,
    filter: AveragesFilter,
): SelectQueryBuilder<T> {
    if (filter.className !== undefined) query.andWhere(`${studentAlias}.className = :filterClass`, { filterClass: filter.className });
    if (filter.section !== undefined) query.andWhere(`${studentAlias}.section = :filterSection`, { filterSection: filter.section });
    if (filter.classes !== undefined) query.andWhere(classCondition(filter.classes, studentAlias));
    return query;
}
