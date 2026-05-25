const fs = require('fs');

function getJpegDimensions(filePath) {
    try {
        const buffer = fs.readFileSync(filePath);
        let i = 2; // skip FF D8
        while (i < buffer.length) {
            if (buffer[i] !== 0xFF) {
                // invalid marker, scan forward
                i++;
                continue;
            }
            const marker = buffer[i + 1];
            if (marker === 0xD9 || marker === 0xDA) {
                // end of image or start of scan (data begins)
                break;
            }
            const length = buffer.readUInt16BE(i + 2);
            // SOF0 (0xC0), SOF1 (0xC1), SOF2 (0xC2), SOF3 (0xC3), SOF5 (0xC5)... SOF15 (0xCF) except SOF4, SOF8, SOF12
            if ((marker >= 0xC0 && marker <= 0xCF) && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) {
                // Found SOF
                const height = buffer.readUInt16BE(i + 5);
                const width = buffer.readUInt16BE(i + 7);
                return { width, height };
            }
            i += 2 + length;
        }
        return null;
    } catch (e) {
        return null;
    }
}

const files = [
    'public/assets/icon.png',
    'public/assets/splash.png',
    'public/favicon.png',
    'public/images/modes/infiltrator.png'
];

files.forEach(f => {
    const dims = getJpegDimensions(f);
    const stat = fs.statSync(f);
    console.log(`${f} | Size: ${(stat.size / 1024).toFixed(2)} KB | Dimensions: ${dims ? `${dims.width}x${dims.height}` : 'N/A'}`);
});
