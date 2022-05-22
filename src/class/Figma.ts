class FigmaApi {
  // Figmaへのアクセストークン
  private static accessToken = '';
  // アクセストークンをヘッダーに設定
  private static headers = {
    'X-Figma-Token': this.accessToken,
  };

  static fetch = async (endPoint: string, params?: any) => {
    const query = params ? queryString(params) : '';
    const response = UrlFetchApp.fetch(FIGMA_ENDPOINT + endPoint + query, {
      headers: this.headers,
    }).getContentText();
    return JSON.parse(response);
  };
}
