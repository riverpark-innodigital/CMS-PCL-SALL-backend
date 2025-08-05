const multer = require('multer');

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const paths = {

            'application/pdf': './uploads/Files/',
            'video/mp4': './uploads/Videos/',
            'image/png': './uploads/Images/',
            'image/jpeg': './uploads/Images/'

        }
        cb(null, paths[file.mimetype]);
    },
    filename: (req, file, cb) => {
        const fileExtension =
            file.mimetype === 'application/pdf' ? '.pdf' : 
            file.mimetype === 'video/mp4' ? '.mp4' : '.png';
        cb(null, Date.now() + '-' + `${Math.random().toString(36).substr(2,5).toUpperCase()}${fileExtension}`); // แปลงชุดตัวเลขที่สุ่มมา เป็นข้อความรูปแบบ base 36 ที่จะเอาตัวเลขไปเข้ารหัสเป็น ตัวอักษรปนกับตัวเลข
        // แต่ข้อความ 2 ตัวแรกจะล็อกเป็น 0. ตลอด เลยใช้ substr ตัด 2 ตัวแรกออก แล้วเอามาแค่ 5 ตัว
    },
});

const upload = multer({ 
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'];

        console.log('URL : ', req.originalUrl);

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type'), false);
        }

        if(req.originalUrl.startsWith('/api/supplier')) {
            return file.mimetype === 'application/pdf' ? cb(new Error('Only .jpg and .png are Allowed'), false) : cb(null, true);
        }

        if(req.originalUrl.startsWith('/api/productsale/')) {

            if (file.fieldname === 'ProductUpVideo' && file.mimetype !== 'video/mp4') {
                return cb(new Error('Only .mp4 video files are allowed for ProductUpVideo'), false);
            }

            if ((file.fieldname === 'ProductImageMain' || file.fieldname === 'ProductImageChildren') && !['image/jpeg', 'image/png'].includes(file.mimetype)) {
                return cb(new Error('Invalid file type for image fields'), false);
            }

        }
        
        if(req.originalUrl.startsWith('/api/companyManage')) {
            if ((file.fieldname === 'compamyFile') && !file.mimetype === 'application/pdf') {
                return cb(new Error('Only .pdf are Allowed'), false);
            }

            if ((file.fieldname === 'compamyPicture') && !['image/jpeg', 'image/png'].includes(file.mimetype)) {
                return cb(new Error('Invalid file type for image fields'), false);
            }
        }

        if(req.originalUrl.startsWith('/api/productFile')) {
            return file.mimetype === 'application/pdf' ? cb(null, true) : cb(new Error('Only .pdf are Allowed'), false);
        }

        cb(null, true);
    },
    limits: {
        fileSize: 104857600
    },
    storage: multerStorage
});

module.exports = upload;