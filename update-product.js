const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

let client;
let clientPromise;

if (!global._mongoClientPromise) {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'PUT') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        await clientPromise;
        const db = client.db(dbName);
        const collection = db.collection('products');

        const productId = event.queryStringParameters.id; // Получаем ID продукта из query parameters
        const updatedProduct = JSON.parse(event.body); // Получаем данные для обновления из тела запроса

        const result = await collection.updateOne(
            { _id: new ObjectId(productId) }, // Используем ObjectId для поиска по _id
            { $set: updatedProduct } // Обновляем поля
        );

        if (result.modifiedCount === 0) {
            return { statusCode: 404, body: JSON.stringify({ message: 'Product not found' }) };
        }

        // Получаем обновленный продукт из базы данных
        const updatedProductFromDB = await collection.findOne({ _id: new ObjectId(productId) });

        return {
            statusCode: 200,
            body: JSON.stringify(updatedProductFromDB), // Возвращаем обновленный продукт
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" // ВНИМАНИЕ: только для разработки! Укажите конкретный домен в production
            }
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to update product' }),
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" // ВНИМАНИЕ: только для разработки! Укажите конкретный домен в production
            }
        };
    }
};