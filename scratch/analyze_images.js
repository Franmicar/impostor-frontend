const fs = require('fs');
const path = require('path');

function getPngDimensions(filePath) {
    try {
        const buffer = fs.readFileSync(filePath);
        // Check PNG signature
        if (buffer[0] !== 0x89 || buffer[1] !== 0x50 || buffer[2] !== 0x4E || buffer[3] !== 0x47) {
            return null;
        }
        // Width is at offset 16 (4 bytes, big-endian)
        const width = buffer.readInt32BE(16);
        // Height is at offset 20 (4 bytes, big-endian)
        const height = buffer.readInt32BE(20);
        return { width, height };
    } catch (e) {
        return null;
    }
}

function traverseDir(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            traverseDir(fullPath, fileList);
        } else if (stat.isFile()) {
            fileList.push({
                path: fullPath,
                size: stat.size
            });
        }
    }
    return fileList;
}

const baseDir = path.resolve(__dirname, '../public');
const images = traverseDir(baseDir);

console.log('--- IMAGE ANALYSIS RESULT ---');
images.forEach(img => {
    const ext = path.extname(img.path).toLowerCase();
    let dims = null;
    if (ext === '.png') {
        dims = getPngDimensions(img.path);
    }
    const relPath = path.relative(baseDir, img.path).replace(/\\/g, '/');
    const sizeKB = (img.size / 1024).toFixed(2);
    const dimStr = dims ? `${dims.width}x${dims.height}` : 'N/A';
    console.log(`${relPath} | Size: ${sizeKB} KB | Dimensions: ${dimStr}`);
});
