import path from 'path';

export default {
    errors: {
        fs: {
            fileExists: 'EEXIST',
        },
    },
    folders: {
        uploads: path.resolve(__dirname, 'uploads'),
    },
};
