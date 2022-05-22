function trimImage(objectParams) {
  const object = {
    unit: 'point',
    ...objectParams,
  };
  return ImgApp.editImage(object);
}
