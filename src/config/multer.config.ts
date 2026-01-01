import multer from "multer";
import {CloudinaryStorage} from "multer-storage-cloudinary"
import { cloudinaryUpload } from "./cloudinary.config";
 
const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
 params: {
        public_id: (req, file) => {
            file.originalname
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/\./g, "-")
                .replace(/[^a-zA-Z0-9\-\.]/g, "")
            const mainName = file.originalname.split(".")
            mainName.pop()

            const uniqueFileName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + mainName
            return uniqueFileName
        }
    }
});
 
export const multerUpload = multer({ storage: storage });