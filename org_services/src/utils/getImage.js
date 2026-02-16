import fs from 'fs-extra';
import path from 'path';

export const getImage = async (req, res, next) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(process.cwd(), 'src/uploads', filename);

        // Check if file exists
        if (!(await fs.pathExists(filePath))) {
            const error = new Error('Image not found');
            error.status = 404;
            throw error;
        }

        // Send file
        res.sendFile(filePath);
    } catch (err) {
        next(err);
    }
};