const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

exports.handler = async (event, context) => {
  let client;

  try {
    const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tlsAllowInvalidCertificates: true // ТОЛЬКО ДЛЯ ЛОКАЛЬНОЙ ОТЛАДКИ!
});
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('products');

    const product = JSON.parse(event.body); // Получаем данные из тела запроса

    const result = await collection.insertOne(product);
    // Получаем добавленный продукт по ID
    const insertedProduct = await collection.findOne({ _id: result.insertedId });

    // Преобразуем _id в строку
    const insertedProductWithStringId = {
      ...insertedProduct,
      _id: insertedProduct._id.toString()
    };

    return {
      statusCode: 200,
      body: JSON.stringify(insertedProductWithStringId),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://koshka-privereda.ru", // Замените "*" на ваш домен
        "Access-Control-Allow-Methods": "POST, OPTIONS", // Разрешенные методы
        "Access-Control-Allow-Headers": "Content-Type" // Разрешенные заголовки
      }
    };
  } catch (error) {
    console.error('Error adding product:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to add product', error: error.message }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://koshka-privereda.ru", // Замените "*" на ваш домен
        "Access-Control-Allow-Methods": "POST, OPTIONS", // Разрешенные методы
        "Access-Control-Allow-Headers": "Content-Type" // Разрешенные заголовки
      }
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};
