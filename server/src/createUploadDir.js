const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../uploads/products');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created upload directory:', uploadDir);
} else {
    console.log('Upload directory already exists:', uploadDir);
}
