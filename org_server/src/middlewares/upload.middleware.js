import { v4 as uuidv4 } from 'uuid';
import fs from 'fs-extra';
import path from 'path';
import Organization from '../models/index.js';
import sharp from 'sharp';



const uploadImage = async (req, res, next) => {
    try {
        const { logo } = req.body;

        // If no logo is provided, proceed without processing
        if (!logo) {
            req.logoFilename = null;
            return next();
        }

        // Validate Base64 string
        const matches = logo.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
        if (!matches || !['jpeg', 'png', 'gif'].includes(matches[1].toLowerCase())) {
            const error = new Error('Invalid or unsupported image format. Only JPEG, PNG, and GIF are allowed.');
            error.status = 400;
            throw error;
        }

        // Decode Base64
        const imageBuffer = Buffer.from(matches[2], 'base64');

        // In upload.middleware.js
        const resizedBuffer = await sharp(imageBuffer)
            .resize({ width: 595 / 2, height: 80, fit: 'contain' })
            .toBuffer();

        // Generate unique filename
        const fileExtension = matches[1].toLowerCase();
        const fileName = `${uuidv4()}.${fileExtension}`;

        // Save image to uploads directory
        const uploadDir = path.join(process.cwd(), 'src/uploads');
        await fs.ensureDir(uploadDir); // Ensure uploads directory exists
        const filePath = path.join(uploadDir, fileName);
        await fs.writeFile(filePath, resizedBuffer);

        req.logoFilename = fileName;

        next();
    } catch (err) {
        next(err);
    }
};


// export const deleteOrganizationLogo = async (id) => {
//     const organization = await Organization.findByPk(id);
//     if (organization?.logo) {
//         const filePath = path.join(process.cwd(), 'src/uploads', organization.logo);
//         await fs.remove(filePath).catch(() => { });
//     }
// };

export default uploadImage;