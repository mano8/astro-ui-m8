export interface ListPageParams {
  page?: number | null;
  pageSize?: number | null;
}

export interface ListOffsetParams {
  skip?: number | null;
  limit?: number | null;
}

export interface ListParamOptions {
  defaultPageSize?: number;
  maxPageSize?: number;
}

export interface NormalizedListParams {
  page: number;
  pageSize: number;
  skip: number;
  limit: number;
}

export const DEFAULT_LIST_PARAMS = {
  defaultPageSize: 20,
  maxPageSize: 100
} as const satisfies Required<ListParamOptions>;

function positiveInteger(value: number | null | undefined): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  const integer = Math.floor(value);
  return integer > 0 ? integer : undefined;
}

function nonNegativeInteger(value: number | null | undefined): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  const integer = Math.floor(value);
  return integer >= 0 ? integer : undefined;
}

function normalizeOptions(options: ListParamOptions = {}): Required<ListParamOptions> {
  const defaultPageSize =
    positiveInteger(options.defaultPageSize) ?? DEFAULT_LIST_PARAMS.defaultPageSize;
  const maxPageSize = Math.max(
    defaultPageSize,
    positiveInteger(options.maxPageSize) ?? DEFAULT_LIST_PARAMS.maxPageSize
  );

  return { defaultPageSize, maxPageSize };
}

function clampPageSize(
  pageSize: number | null | undefined,
  options: Required<ListParamOptions>
): number {
  const normalized = positiveInteger(pageSize) ?? options.defaultPageSize;
  return Math.min(normalized, options.maxPageSize);
}

export function normalizeListParams(
  params: ListPageParams & ListOffsetParams = {},
  options?: ListParamOptions
): NormalizedListParams {
  if (params.skip !== undefined || params.limit !== undefined) {
    return offsetToListParams(params, options);
  }

  return listParamsToOffset(params, options);
}

export function listParamsToOffset(
  params: ListPageParams = {},
  options?: ListParamOptions
): NormalizedListParams {
  const normalizedOptions = normalizeOptions(options);
  const page = positiveInteger(params.page) ?? 1;
  const pageSize = clampPageSize(params.pageSize, normalizedOptions);

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    limit: pageSize
  };
}

export function offsetToListParams(
  params: ListOffsetParams = {},
  options?: ListParamOptions
): NormalizedListParams {
  const normalizedOptions = normalizeOptions(options);
  const skip = nonNegativeInteger(params.skip) ?? 0;
  const limit = clampPageSize(params.limit, normalizedOptions);
  const page = Math.floor(skip / limit) + 1;

  return {
    page,
    pageSize: limit,
    skip,
    limit
  };
}
