const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

exports.handler = async (event, context) => {
  let client;

  try {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

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
    console.error('Error adding product:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to add product' }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // ВНИМАНИЕ: только для разработки! Укажите конкретный домен в production
      }
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};
