/** トリミング範囲 */
type Crop = {
  /** top */
  t: number;
  /** bottom */
  b: number;
  /** left */
  l: number;
  /** right */
  r: number;
};

/** トリミングオブジェクトパラメーター */
type TrimImageObject = {
  /** Blob */
  blob: GoogleAppsScript.Base.Blob;
  /** トリミング範囲 */
  crop: Crop;
  /** トリミング後画像幅 */
  outputWidth: number;
};
