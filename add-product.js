const { MongoClient } = require('mongodb');

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
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    await clientPromise; // Используем закешированное подключение
    // ПОДКЛЮЧАЕМСЯ К БД ЧЕРЕЗ client
    const db = client.db(dbName);
    const collection = db.collection('products');

    const product = JSON.parse(event.body); // Получаем данные из тела запроса

    const result = await collection.insertOne(product);
    // Получаем добавленный продукт по ID
    const insertedProduct = await collection.findOne({ _id: result.insertedId });

    return {
      statusCode: 200,
      body: JSON.stringify(insertedProduct),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // ВНИМАНИЕ: только для разработки! Укажите конкретный домен в production
      }
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to add product' }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // ВНИМАНИЕ: только для разработки! Укажите конкретный домен в production
      }
    };
  }
};