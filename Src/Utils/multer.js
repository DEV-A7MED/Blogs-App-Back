
import multer from 'multer'

export const allowedExtensions = {
    image: ['image/jpeg','image/jpg', 'image/png'],
}
export function uploadPhoto({ customValidation = allowedExtensions.image }={}) {
    const storage = multer.diskStorage({})
    function fileFilter(req, file, cb) {
        if (customValidation.includes(file.mimetype)) {
            return cb(null, true)
        }
        return cb(new Error("in-valid image extension", { cause: 400 }), false)

    }
    const upload = multer({ fileFilter, storage })
    return upload;
}