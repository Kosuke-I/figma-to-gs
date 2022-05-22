/**
 * GET file API リクエストパラメータ
 */
interface GetFileParams {
  version?: string;
  ids?: string;
  depth?: number;
  geometry?: string;
  plugin_data?: string;
  branch_data?: string;
}

/**
 * GET file nodes API リクエストパラメータ
 */
interface GetFileNodesParams {
  ids: string;
  version?: string;
  depth?: number;
  geometry?: string;
  plugin_data?: string;
}

/**
 * GET image API リクエストパラメータ
 */
interface GetImageParams {
  ids: string;
  scale?: Number;
  format?: String;
  svg_include_id?: Boolean;
  svg_simplify_stroke?: Boolean;
  use_absolute_bounds?: Boolean;
  version?: String;
}
