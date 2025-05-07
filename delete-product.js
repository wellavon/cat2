// netlify/functions/delete-product.js
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
  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection('products');

    const productId = event.queryStringParameters.id; // Получаем ID продукта из query parameters

    const result = await collection.deleteOne({ _id: new ObjectId(productId) });

    if (result.deletedCount === 0) {
      return { statusCode: 404, body: JSON.stringify({ message: 'Product not found' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Product deleted successfully" }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // ВНИМАНИЕ: только для разработки! Укажите конкретный домен в production
      }
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to delete product' }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // ВНИМАНИЕ: только для разработки! Укажите конкретный домен в production
      }
    };
  }
};
