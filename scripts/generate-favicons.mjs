import sharp from "sharp";

const source = "public/favicon/cat-favicon-source.png";
const sizes = [16, 32, 128, 180, 192];
const themeColors = {
	light: 0,
	dark: 255,
};

const { data: mask, info } = await sharp(source)
	.grayscale()
	.raw()
	.toBuffer({ resolveWithObject: true });

function createTransparentSource(color) {
	const rgba = Buffer.alloc(info.width * info.height * 4);
	for (let pixel = 0; pixel < mask.length; pixel++) {
		const offset = pixel * 4;
		rgba[offset] = color;
		rgba[offset + 1] = color;
		rgba[offset + 2] = color;
		rgba[offset + 3] = mask[pixel];
	}
	return rgba;
}

for (const [theme, color] of Object.entries(themeColors)) {
	const transparentSource = createTransparentSource(color);
	const raw = {
		width: info.width,
		height: info.height,
		channels: 4,
	};

	await sharp(transparentSource, { raw })
		.png({ compressionLevel: 9, palette: false })
		.toFile(`public/favicon/cat-favicon-${theme}-source.png`);

	for (const size of sizes) {
		await sharp(transparentSource, { raw })
			.resize(size, size, {
				fit: "fill",
				kernel: sharp.kernel.lanczos3,
			})
			.png({ compressionLevel: 9, palette: false })
			.toFile(`public/favicon/favicon-${theme}-${size}.png`);
	}
}

for (const size of sizes) {
	const metadata = await sharp(
		`public/favicon/favicon-light-${size}.png`,
	).metadata();
	console.log(`${size}: ${metadata.width}x${metadata.height} ${metadata.format}`);
}
