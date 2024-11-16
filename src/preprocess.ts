export function normalize(
  image: number[][][],
  mean: number[] = [0.5, 0.5, 0.5],
  std: number[] = [0.5, 0.5, 0.5]
): number[][][] {
  return image.map((channel, i) =>
    channel.map(row =>
      row.map(pixel => (pixel - mean[i]) / std[i])
    )
  );
}

export function createPatches(
  image: ImageData,
  imagePatchSize: number = 378
): number[][][] {
  // Convert ImageData to normalized array
  const normalized = new Array(3).fill(0).map((_, channel) =>
    new Array(imagePatchSize).fill(0).map((_, y) =>
      new Array(imagePatchSize).fill(0).map((_, x) => {
        const idx = (y * imagePatchSize + x) * 4;
        return image.data[idx + channel] / 255.0;
      })
    )
  );

  return normalize(normalized);
}
