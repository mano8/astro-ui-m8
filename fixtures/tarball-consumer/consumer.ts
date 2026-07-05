import {
  DEFAULT_LIST_PARAMS,
  listParamsToOffset,
  normalizeListParams,
  offsetToListParams
} from "@mano8/astro-ui-m8";

const normalized = normalizeListParams({ page: 3, pageSize: 25 }, DEFAULT_LIST_PARAMS);
const offset = listParamsToOffset(normalized);
const page = offsetToListParams(offset);

if (page.page !== 3 || page.pageSize !== 25) {
  throw new Error("Installed tarball runtime helpers returned an unexpected result");
}
