const InitRole = require('./data/role');
const InitUser = require('./data/user');

const initailDatas = async () => {
    try { 
        await InitRole();
        await InitUser();
    } catch (err) {
        console.error('Error initializing data:', err);
    }
};

module.exports = initailDatas;