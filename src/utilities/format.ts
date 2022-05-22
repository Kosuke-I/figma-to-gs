function zeroPadding(value: string, length: number) {
  const difference = length - value.length;
  if (difference > 0) {
    for (var i = 0; i < difference; i++) {
      value = '0' + value;
    }
  }
  return value;
}
