import { BadRequestException } from "@/exceptions/http/BadRequestException";

const DEFAULT_OPERATORS = ["like", "eq", "ne", "gte", "lte", "in"] as const;
type Operator = (typeof DEFAULT_OPERATORS)[number];

const MAX_GROUP_DEPTH = 2;
const MAX_CONDITIONS_PER_GROUP = 10;
const MAX_TOTAL_CONDITIONS = 20;

interface RestQueryConfig<
  TSortField extends string,
  TSearchField extends string,
> {
  allowedSortFields: readonly TSortField[];
  allowedSearchFields: readonly TSearchField[];
  allowedOperators?: readonly Operator[];
  defaultSortField: TSortField;
  defaultLimit?: number;
  maxLimit?: number;
}

interface ParsedRestQuery<TSortField extends string> {
  page: number;
  limit: number;
  sortBy: TSortField;
  sortOrder: "asc" | "desc";
  where: Record<string, any>;
}

type SearchCondition = Record<string, Partial<Record<Operator, string>>>;
type RawSearchInput = SearchCondition & {
  or?: SearchCondition[];
  and?: SearchCondition[];
};

/**
 * Walks the search tree purely to enforce limits — does not build
 * any query clauses. Throws BadRequestException if the client sends
 * something too deep/wide to be a reasonable filter, protecting the
 * DB from expensive/degenerate query plans.
 */
function assertWithinComplexityLimits(
  node: any,
  depth: number,
  totalCount: { value: number },
): void {
  if (!node || typeof node !== "object") return;

  if (depth > MAX_GROUP_DEPTH) {
    throw new BadRequestException(
      `Search nesting exceeds max depth of ${MAX_GROUP_DEPTH}`,
    );
  }

  for (const groupKey of ["or", "and"] as const) {
    const group = node[groupKey];
    if (!Array.isArray(group)) continue;

    if (group.length > MAX_CONDITIONS_PER_GROUP) {
      throw new BadRequestException(
        `'${groupKey}' group exceeds max of ${MAX_CONDITIONS_PER_GROUP} conditions`,
      );
    }

    for (const child of group) {
      assertWithinComplexityLimits(child, depth + 1, totalCount);
    }
  }

  const { or, and, ...fieldConditions } = node;
  for (const operators of Object.values(fieldConditions)) {
    if (!operators || typeof operators !== "object") continue;
    totalCount.value += Object.keys(operators).length;

    if (totalCount.value > MAX_TOTAL_CONDITIONS) {
      throw new BadRequestException(
        `Search exceeds max of ${MAX_TOTAL_CONDITIONS} total conditions`,
      );
    }
  }
}

function buildFieldCondition(
  field: string,
  operator: Operator,
  value: string,
): Record<string, any> {
  switch (operator) {
    case "like":
      return { [field]: { contains: value, mode: "insensitive" } };
    case "eq":
      return { [field]: value };
    case "ne":
      return { [field]: { not: value } };
    case "gte":
      return { [field]: { gte: value } };
    case "lte":
      return { [field]: { lte: value } };
    case "in":
      return { [field]: { in: value.split(",") } };
  }
}

function buildConditionGroup<TSearchField extends string>(
  condition: SearchCondition,
  allowedSearchFields: readonly TSearchField[],
  allowedOperators: readonly Operator[],
): Record<string, any>[] {
  const clauses: Record<string, any>[] = [];

  for (const [field, operators] of Object.entries(condition)) {
    if (!allowedSearchFields.includes(field as TSearchField)) continue;
    if (!operators || typeof operators !== "object") continue;

    for (const [operator, value] of Object.entries(operators)) {
      if (!allowedOperators.includes(operator as Operator)) continue;
      if (typeof value !== "string") continue;

      clauses.push(buildFieldCondition(field, operator as Operator, value));
    }
  }

  return clauses;
}

function buildWhereFromSearch<TSearchField extends string>(
  search: RawSearchInput | undefined,
  allowedSearchFields: readonly TSearchField[],
  allowedOperators: readonly Operator[],
): Record<string, any> {
  if (!search) return {};

  assertWithinComplexityLimits(search, 0, { value: 0 });

  const clauses: Record<string, any>[] = [];

  if (Array.isArray(search.or)) {
    const orClauses = search.or.flatMap((c) =>
      buildConditionGroup(c, allowedSearchFields, allowedOperators),
    );
    if (orClauses.length > 0) clauses.push({ OR: orClauses });
  }

  if (Array.isArray(search.and)) {
    const andClauses = search.and.flatMap((c) =>
      buildConditionGroup(c, allowedSearchFields, allowedOperators),
    );
    if (andClauses.length > 0) clauses.push(...andClauses);
  }

  const { or, and, ...rest } = search;
  clauses.push(
    ...buildConditionGroup(
      rest as SearchCondition,
      allowedSearchFields,
      allowedOperators,
    ),
  );

  return clauses.length > 0 ? { AND: clauses } : {};
}

function parseSort<TSortField extends string>(
  rawSort: unknown,
  allowedSortFields: readonly TSortField[],
  defaultSortField: TSortField,
): { sortBy: TSortField; sortOrder: "asc" | "desc" } {
  const sortStr = typeof rawSort === "string" ? rawSort : defaultSortField;
  const isDescending = sortStr.startsWith("-");
  const field = isDescending ? sortStr.slice(1) : sortStr;

  const sortBy = allowedSortFields.includes(field as TSortField)
    ? (field as TSortField)
    : defaultSortField;

  return { sortBy, sortOrder: isDescending ? "desc" : "asc" };
}


export function createRestQueryParser<
  TSortField extends string,
  TSearchField extends string,
>(config: RestQueryConfig<TSortField, TSearchField>) {
  const allowedOperators = config.allowedOperators ?? DEFAULT_OPERATORS;
  const defaultLimit = config.defaultLimit ?? 20;
  const maxLimit = config.maxLimit ?? 100;

  return function parse(raw: Record<string, any>): ParsedRestQuery<TSortField> {
    const page = Math.max(1, parseInt(raw.page, 10) || 1);
    const limit = Math.min(
      maxLimit,
      Math.max(1, parseInt(raw["per-page"], 10) || defaultLimit),
    );
    const { sortBy, sortOrder } = parseSort(
      raw.sort,
      config.allowedSortFields,
      config.defaultSortField,
    );
    const where = buildWhereFromSearch(
      raw.search as RawSearchInput | undefined,
      config.allowedSearchFields,
      allowedOperators,
    );

    return { page, limit, sortBy, sortOrder, where };
  };
}
