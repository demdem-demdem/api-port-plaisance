const mongoose = require('mongoose')

const clientOptions = {
    dbName: 'api-port-plaisance'
};

exports.initClientDbConnection = async () => {
    try {
        await mongoose.connect(process.env.URL_MONGO, clientOptions)
        console.log('Connected');
    } catch (err) {
        console.log(err);
        throw err;
    }
}