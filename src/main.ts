// プロジェクトのkeyID
const key = '';

// 同期するslidesがまとめられたspereadsheetID
const spreadSheetID = '';
// sheet名
const sheetName = 'SyncSlides';

// GSに送信するnodeのsuffix
const gsSuffixSpRegExp = new RegExp('-GS:SP-$');
const gsSuffixPcRegExp = new RegExp('-GS:PC-$');

const figmaToGs = async () => {
  // 受信したいslidesの取得
  // 同期するslidesがまとめられたspereadsheetの取得
  const spreadSheet = SpreadsheetApp.openById(spreadSheetID);
  if (!spreadSheet) {
    console.error('スプレッドシートが見つかりません');
    return;
  }

  // sheetの取得
  const sheet = spreadSheet.getSheetByName(sheetName);
  if (!sheet) {
    console.error('シートが見つかりません');
    return;
  }

  // spreadsheetから受信したいslidesの取得
  const slidesIdList: string[] = sheet
    .getRange(2, 2, sheet.getLastRow() - 1)
    .getValues()
    .flat()
    .filter((cell) => cell);
  if (slidesIdList.length < 1) {
    console.error('スライドIDが見つかりません');
    return;
  }

  // 受信したいslidesのファイル名を取得
  const slidesFileNameList = slidesIdList.map((slidesId) => {
    const fileName = SlidesApp.openById(slidesId).getName();
    return {
      slidesId: slidesId,
      fileName: fileName,
    };
  });

  // Figmaからproject内のnodeを取得
  const getFileResponse = await getFile(key);

  // 送信したいslidesと同一名のPagesを取得
  const pageList = getFileResponse.document.children.filter((nodeViewing) => {
    return !!slidesFileNameList.find((slidesFileName) => {
      return nodeViewing.name === slidesFileName.fileName;
    });
  });

  // 送信するnodeIDリストと対応デバイス
  const nodeIdAndDeviceList = pageList
    .flatMap((page) => {
      if (page.type !== FIGMA_NODE_TYPE.CANVAS) {
        console.error('不明なtypeのnodeが確認されました');
        return;
      }

      // Pagesの取得
      const canvas = page as NodeViewing<'CANVAS'>;

      return canvas.children.map((node) => {
        if (gsSuffixSpRegExp.test(node.name)) {
          return { nodeId: zeroPadding(encodeURI(node.id), 5), device: 'SP' };
        } else if (gsSuffixPcRegExp.test(node.name)) {
          return { nodeId: zeroPadding(encodeURI(node.id), 5), device: 'PC' };
        }
      });
    })
    .filter(
      (value): value is { nodeId: string; device: string } =>
        value !== undefined
    );

  // クエリパラメータ
  const params: GetImageParams = {
    ids: nodeIdAndDeviceList
      .map((nodeIdAndDevice) => {
        return nodeIdAndDevice.nodeId;
      })
      .join(','),
  };

  // nodeIDから画像を取得する
  const getImageResponse = await getImage(key, params);

  // 指定したnodeの画像URLリスト
  const imageUrlList = nodeIdAndDeviceList
    .map((nodeIdAndDevice) => {
      return getImageResponse.images[nodeIdAndDevice.nodeId];
    })
    .filter((value): value is string => value !== undefined);

  // 画像情報リストの取得
  const imageListResponse = UrlFetchApp.fetchAll(imageUrlList);

  // 画像操作用Slidesの作成
  // TODO 今のところ、送信先Slidesを指定
  var imageDummyPresentation = SlidesApp.openById(
    slidesFileNameList[0].slidesId
  );

  // 画像BlobリストからSlidesに画像を挿入する
  imageListResponse.forEach((image, index) => {
    const request = [
      {
        createSlide: { objectId: nodeIdAndDeviceList[index].nodeId },
      },
    ];

    Slides.Presentations?.batchUpdate(
      { requests: request },
      imageDummyPresentation.getId()
    );

    // 以降で追加したスライドを編集するために一旦保存
    imageDummyPresentation.saveAndClose();

    // 編集するために再度オープン
    imageDummyPresentation = SlidesApp.openById(slidesFileNameList[0].slidesId);

    const appendSlide = imageDummyPresentation.getSlides().find((slide) => {
      return slide.getObjectId() === nodeIdAndDeviceList[index].nodeId;
    });

    // 編集用スライドが見つからない場合、処理を終了
    if (!appendSlide) {
      console.error('スライドが見つかりませんでした');
      return;
    }

    appendSlide.insertImage(image.getBlob());
    const imageInSlide = appendSlide.getImages()[0];
    const imageHeight = imageInSlide.getHeight();
    const imageWidth = imageInSlide.getWidth();

    // SP
    if (nodeIdAndDeviceList[index].device === 'SP') {
      // 規定の大きさに操作
      const ratio = 180 / imageWidth;

      // slides内の位置を指定
      imageInSlide.setTop(75);
      imageInSlide.setLeft(37);

      // 画像の横幅、縦幅を指定
      imageInSlide.setWidth(imageWidth * ratio);
      imageInSlide.setHeight(imageHeight * ratio);

      const scaledImageHeight = imageInSlide.getHeight();
      // スライドからはみ出る場合
      if (scaledImageHeight > 320) {
        // トリミング回数を算出
        const trimmingCount = Math.ceil(scaledImageHeight / 320);
        // 最後の中途半端な画像の高さ
        const lastImageHeight =
          ((imageInSlide.getHeight() * 2 -
            ((480 * 4) / 3) * (trimmingCount - 1)) *
            3) /
          4;
        for (let i = 0; i < trimmingCount; i++) {
          const object = {
            blob: imageInSlide.getBlob(),
            crop: {
              t: 480 * i,
              b:
                trimmingCount - 1 === i
                  ? 0
                  : Math.floor(lastImageHeight + 480 * (trimmingCount - 2 - i)),
              l: 0,
              r: 0,
            },
            outputWidth: 180,
          };
          const trimmedImage = trimImage(object);

          const request = [
            {
              createSlide: {
                objectId: nodeIdAndDeviceList[index].nodeId + '-' + i,
              },
            },
          ];

          Slides.Presentations?.batchUpdate(
            { requests: request },
            imageDummyPresentation.getId()
          );

          // 以降で追加したスライドを編集するために一旦保存
          imageDummyPresentation.saveAndClose();

          // 編集するために再度オープン
          imageDummyPresentation = SlidesApp.openById(
            slidesFileNameList[0].slidesId
          );

          const trimmedAppendSlide = imageDummyPresentation
            .getSlides()
            .find((slide) => {
              return (
                slide.getObjectId() ===
                nodeIdAndDeviceList[index].nodeId + '-' + i
              );
            });

          // 編集用スライドが見つからない場合、処理を終了
          if (!trimmedAppendSlide) {
            console.error('スライドが見つかりませんでした');
            return;
          }

          trimmedAppendSlide.insertImage(trimmedImage);
          const appendImageInSlide = trimmedAppendSlide.getImages()[0];
          appendImageInSlide.setTop(75);
          appendImageInSlide.setLeft(37);
          appendImageInSlide.setWidth(imageWidth * ratio);
          if (trimmingCount - 1 !== i) {
            appendImageInSlide.setHeight(320);
          }
        }
        // トリミング前の編集用スライドの削除
        imageDummyPresentation = SlidesApp.openById(
          slidesFileNameList[0].slidesId
        );

        const slideForDelete = imageDummyPresentation
          .getSlides()
          .find((slide) => {
            return slide.getObjectId() === nodeIdAndDeviceList[index].nodeId;
          });
        slideForDelete?.remove();
      }
    } else {
      // PC
      // FigmaのFrame幅が500より大きい場合をPCとみなす
      const ratio = 400 / imageWidth;

      // slides内の位置を指定
      imageInSlide.setTop(92);
      imageInSlide.setLeft(12);

      // 画像の横幅、縦幅を指定
      imageInSlide.setWidth(imageWidth * ratio);
      imageInSlide.setHeight(imageHeight * ratio);

      const scaledImageHeight = imageInSlide.getHeight();
      // スライドからはみ出る場合
      if (scaledImageHeight > 300) {
        // トリミング回数を算出
        const trimmingCount = Math.ceil(scaledImageHeight / 300);
        // 最後の中途半端な画像の高さ
        const lastImageHeight =
          ((imageInSlide.getHeight() * 3.61 -
            ((770 * 4) / 3) * (trimmingCount - 1)) *
            3) /
          4;

        for (let i = 0; i < trimmingCount; i++) {
          const object = {
            blob: imageInSlide.getBlob(),
            crop: {
              t: 770 * i,
              b:
                trimmingCount - 1 === i
                  ? 0
                  : Math.floor(lastImageHeight + 770 * (trimmingCount - 2 - i)),
              l: 0,
              r: 0,
            },
            outputWidth: 500,
          };
          const trimmedImage = trimImage(object);

          // nodeIdをSlidesのタイトルに挿入する
          const request = [
            {
              createSlide: {
                objectId: nodeIdAndDeviceList[index].nodeId + '-' + i,
              },
            },
          ];

          Slides.Presentations?.batchUpdate(
            { requests: request },
            imageDummyPresentation.getId()
          );

          // 以降で追加したスライドを編集するために一旦保存
          imageDummyPresentation.saveAndClose();

          // 編集するために再度オープン
          imageDummyPresentation = SlidesApp.openById(
            slidesFileNameList[0].slidesId
          );

          const trimmedAppendSlide = imageDummyPresentation
            .getSlides()
            .find((slide) => {
              return (
                slide.getObjectId() ===
                nodeIdAndDeviceList[index].nodeId + '-' + i
              );
            });

          // 編集用スライドが見つからない場合、処理を終了
          if (!trimmedAppendSlide) {
            console.error('スライドが見つかりませんでした');
            return;
          }

          trimmedAppendSlide.insertImage(trimmedImage);
          const appendImageInSlide = trimmedAppendSlide.getImages()[0];
          appendImageInSlide.setTop(92);
          appendImageInSlide.setLeft(12);
          appendImageInSlide.setWidth(imageWidth * ratio);
          if (trimmingCount - 1 !== i) {
            appendImageInSlide.setHeight(300);
          }
        }

        // トリミング前の編集用スライドの削除
        imageDummyPresentation = SlidesApp.openById(
          slidesFileNameList[0].slidesId
        );

        const slideForDelete = imageDummyPresentation
          .getSlides()
          .find((slide) => {
            return slide.getObjectId() === nodeIdAndDeviceList[index].nodeId;
          });
        slideForDelete?.remove();
      }
    }
  });

  imageDummyPresentation.saveAndClose();
};
