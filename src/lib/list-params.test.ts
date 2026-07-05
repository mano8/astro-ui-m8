import { describe, expect, it } from "vitest";

import {
  DEFAULT_LIST_PARAMS,
  listParamsToOffset,
  normalizeListParams,
  offsetToListParams
} from "./list-params.js";

describe("list param helpers", () => {
  it("exports stable default bounds", () => {
    expect(DEFAULT_LIST_PARAMS).toEqual({
      defaultPageSize: 20,
      maxPageSize: 100
    });
  });

  it("converts one-based pages into offset params", () => {
    expect(listParamsToOffset({ page: 3, pageSize: 25 })).toEqual({
      page: 3,
      pageSize: 25,
      skip: 50,
      limit: 25
    });
  });

  it("normalizes invalid page params to safe defaults", () => {
    expect(
      listParamsToOffset(
        { page: Number.NaN, pageSize: -1 },
        { defaultPageSize: 15, maxPageSize: 40 }
      )
    ).toEqual({
      page: 1,
      pageSize: 15,
      skip: 0,
      limit: 15
    });
  });

  it("floors decimal inputs and clamps oversized page sizes", () => {
    expect(
      listParamsToOffset(
        { page: 2.9, pageSize: 500.5 },
        { defaultPageSize: 10, maxPageSize: 50 }
      )
    ).toEqual({
      page: 2,
      pageSize: 50,
      skip: 50,
      limit: 50
    });
  });

  it("keeps max page size at least as large as the default page size", () => {
    expect(
      listParamsToOffset(
        { page: 1, pageSize: 90 },
        { defaultPageSize: 75, maxPageSize: 50 }
      )
    ).toEqual({
      page: 1,
      pageSize: 75,
      skip: 0,
      limit: 75
    });
  });

  it("converts offset params back to normalized page params", () => {
    expect(offsetToListParams({ skip: 40, limit: 20 })).toEqual({
      page: 3,
      pageSize: 20,
      skip: 40,
      limit: 20
    });
  });

  it("normalizes invalid offset params to safe defaults", () => {
    expect(
      offsetToListParams(
        { skip: -5, limit: Number.POSITIVE_INFINITY },
        { defaultPageSize: 12, maxPageSize: 36 }
      )
    ).toEqual({
      page: 1,
      pageSize: 12,
      skip: 0,
      limit: 12
    });
  });

  it("normalizes absent offset numbers to safe defaults", () => {
    expect(offsetToListParams({ skip: null, limit: null })).toEqual({
      page: 1,
      pageSize: 20,
      skip: 0,
      limit: 20
    });
  });

  it("uses offset normalization when skip or limit are present", () => {
    expect(normalizeListParams({ page: 9, pageSize: 9, skip: 30, limit: 15 })).toEqual({
      page: 3,
      pageSize: 15,
      skip: 30,
      limit: 15
    });
  });

  it("uses page normalization when offset params are absent", () => {
    expect(normalizeListParams({ page: 4, pageSize: 10 })).toEqual({
      page: 4,
      pageSize: 10,
      skip: 30,
      limit: 10
    });
  });
});
