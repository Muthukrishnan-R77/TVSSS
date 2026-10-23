const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'assets', 'images', 'hero');
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const src = 'C:/Users/muthu/.gemini/antigravity-ide/brain/78b054e7-3b87-42da-b1bf-51a02ae40c0d/hero_sensing_manufacturing_1789977171534.jpg';
const dest = path.join(targetDir, 'hero_sensing_manufacturing.jpg');

fs.copyFileSync(src, dest);
console.log('HERO_COPY_SUCCESS:', fs.statSync(dest).size);
