/**
 * GET file
 * @param key ファイルキー
 * @param params クエリパラメータ
 * @returns GET file nodes
 */
const getFile = async (
  key: string,
  params?: GetFileNodesParams
): Promise<GetFileResult> => {
  const endPoint = '/files/' + key;
  return await FigmaApi.fetch(endPoint, params);
};

/**
 * GET file nodes
 * @param key ファイルキー
 * @param params クエリパラメータ
 * @returns GET file nodes
 */
const getFileNodes = async (
  key: string,
  params: GetFileNodesParams
): Promise<GetFileNodesResult> => {
  const endPoint = '/files/' + key + '/nodes';
  return FigmaApi.fetch(endPoint, params);
};

/**
 * GET image
 * @param key ファイルキー
 * @param params クエリパラメータ
 * @returns GET image
 */
const getImage = async (
  key: string,
  params: GetImageParams
): Promise<GetImageResult> => {
  const endPoint = '/images/' + key;
  return FigmaApi.fetch(endPoint, params);
};

/**
 * GET image fills
 * @param key ファイルキー
 * @returns GET image fills
 */
const getImageFills = async (key: string): Promise<GetImageFillsResult> => {
  const endPoint = '/files/' + key + '/images';
  return FigmaApi.fetch(endPoint);
};
