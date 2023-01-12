const multer= require('multer');

const Storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});



  const editedStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});


module.exports={
    uploads:multer({storage:Storage}).single('file'),
    editeduploads:multer({storage:editedStorage}).single('file2')

}
  


