function queryString(obj: any, encode?: boolean) {
  return (
    '?' +
    Object.keys(obj)
      .map(function (key) {
        if (encode) {
          return key + '=' + encodeURIComponent(obj[key]);
        } else {
          return key + '=' + obj[key];
        }
      })
      .join('&')
  );
}
