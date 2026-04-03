const mongoose = require('mongoose')

const clientOptions = {
    dbName: 'api-port-plaisance'
};

exports.initClientDbConnection = async () => {
    if (!process.env.URL_MONGO) {
        console.error('Erreur : La variable d\'environnement URL_MONGO est manquante.');
        throw new Error('URL_MONGO_MISSING');
    }

    try {
        await mongoose.connect(process.env.URL_MONGO, clientOptions)
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        throw err;
    }
}