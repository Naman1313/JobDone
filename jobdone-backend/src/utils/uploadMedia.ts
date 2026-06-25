import cloudinary from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';

export const uploadMedia = async (
    filePath: string,
    folder: string,
    resourceType: 'image' | 'video' | 'auto' = 'auto'
): Promise<UploadApiResponse> => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: `jobdone/${folder}`,
            resource_type: resourceType,
            quality: 'auto',
            fetch_format: 'auto',
        });
        return result;
    } catch (error) {
        throw new Error(`Media upload failed: ${error}`);
    }
};

export const deleteMedia = async (publicId: string): Promise<void> => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        throw new Error(`Media delete failed: ${error}`);
    }
};