const fs = require('fs');
const zlib = require('zlib');

// Create a 32x32 PNG buffer from raw RGBA pixels
function create32x32Png() {
  const width = 32;
  const height = 32;

  // Let's draw dark rounded background #18181b with green bolt
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let pos = 0;

  // Helper to determine if (x, y) is inside the lightning bolt
  // Lucide Zap normalized coordinates in [0, 24]:
  // Points roughly form lightning:
  // Top peak: (13, 2), top right: (20, 10), mid indent: (13, 10),
  // bottom point: (11, 22), mid left indent: (11, 14), left point: (4, 14)
  for (let y = 0; y < height; y++) {
    rawData[pos++] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      // Rounded corner check (radius = 7)
      const dx = Math.min(x, width - 1 - x);
      const dy = Math.min(y, height - 1 - y);
      const isCorner = dx < 7 && dy < 7 && (dx - 7) ** 2 + (dy - 7) ** 2 > 7 ** 2;

      if (isCorner) {
        rawData[pos++] = 0;
        rawData[pos++] = 0;
        rawData[pos++] = 0;
        rawData[pos++] = 0; // Transparent
        continue;
      }

      // Check if inside inner 24x24 zap area
      const zx = x - 4;
      const zy = y - 4;
      let isZap = false;

      if (zx >= 0 && zx < 24 && zy >= 0 && zy < 24) {
        // Approximate the 2 triangles of the lightning bolt
        // Top triangle: (13, 2) to (20, 10) to (13, 10) to (4, 14) to (12, 10)...
        // Upper diagonal blade:
        const t1 = (zx >= 11 - (zy * 0.7) && zx <= 15 + (zy * 0.4) && zy >= 2 && zy <= 10);
        // Middle horizontal bar connecting:
        const tMid = (zx >= 8 && zx <= 20 && zy >= 9 && zy <= 12);
        // Lower diagonal blade:
        const t2 = (zx >= 8 + (zy - 12) * 0.3 && zx <= 13 - (zy - 12) * 0.3 && zy >= 11 && zy <= 22);
        if (t1 || tMid || t2) {
          isZap = true;
        }
      }

      if (isZap) {
        // Emerald 500: #10b981 (16, 185, 129)
        rawData[pos++] = 16;
        rawData[pos++] = 185;
        rawData[pos++] = 129;
        rawData[pos++] = 255;
      } else {
        // Zinc 900: #18181b (24, 24, 27)
        rawData[pos++] = 24;
        rawData[pos++] = 24;
        rawData[pos++] = 27;
        rawData[pos++] = 255;
      }
    }
  }

  // CRC32 calculation helper
  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      let byte = buf[i];
      for (let j = 0; j < 8; j++) {
        if ((crc ^ byte) & 1) {
          crc = (crc >>> 1) ^ 0xedb88320;
        } else {
          crc = crc >>> 1;
        }
        byte = byte >>> 1;
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const crcVal = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crcVal, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // PNG Signature
  const pngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT (compressed raw pixels)
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([pngSig, ihdrChunk, idatChunk, iendChunk]);
}

const pngBuf = create32x32Png();

// Wrap PNG inside ICO header
const icoHeader = Buffer.alloc(6 + 16);
icoHeader.writeUInt16LE(0, 0); // Reserved
icoHeader.writeUInt16LE(1, 2); // Type: Icon
icoHeader.writeUInt16LE(1, 4); // Number of images: 1

// Directory entry
icoHeader.writeUInt8(32, 6); // Width: 32
icoHeader.writeUInt8(32, 7); // Height: 32
icoHeader.writeUInt8(0, 8);  // Color count
icoHeader.writeUInt8(0, 9);  // Reserved
icoHeader.writeUInt16LE(1, 10); // Color planes
icoHeader.writeUInt16LE(32, 12); // Bits per pixel
icoHeader.writeUInt32LE(pngBuf.length, 14); // Image size
icoHeader.writeUInt32LE(22, 18); // Image offset

const icoBuf = Buffer.concat([icoHeader, pngBuf]);

fs.writeFileSync('public/favicon.ico', icoBuf);
fs.writeFileSync('src/app/favicon.ico', icoBuf);
console.log('Successfully wrote public/favicon.ico and src/app/favicon.ico');

