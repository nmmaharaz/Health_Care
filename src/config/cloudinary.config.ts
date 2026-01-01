import { v2 as cloudinary } from 'cloudinary';
import { envVars } from './env';

cloudinary.config({
    cloud_name: envVars.cloud_name,
    api_key: envVars.api_key,
    api_secret: envVars.api_secret
});


export const cloudinaryUpload = cloudinary