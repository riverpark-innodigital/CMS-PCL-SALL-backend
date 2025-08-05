const fs = require('fs').promises;

const createFolder = async () => {
    try {    
        await fs.mkdir('uploads', {recursive: true});
        await fs.mkdir('./uploads/Images', {recursive: true});
        await fs.mkdir('./uploads/Files', {recursive: true});
        await fs.mkdir('./uploads/Videos', {recursive: true});
        console.log('✅ innitialize folder successfully');
    } catch (error) {
        console.log(error);
    }
};

module.exports = createFolder;