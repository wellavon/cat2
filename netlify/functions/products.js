const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

exports.handler = async (event, context) => {
  let client; // Объявляем client один раз
  try {
    client = new MongoClient(uri, { // Убираем const
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // tlsAllowInvalidCertificates: true // ТОЛЬКО ДЛЯ ЛОКАЛЬНОЙ ОТЛАДКИ! УДАЛИТЬ ПЕРЕД ДЕПЛОЕМ В PRODUCTION
    });
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('products');
    const products = await collection.find({}).toArray();

    // Convert _id ObjectId to string for frontend compatibility
    const productsWithStringId = products.map(product => {
      try {
        return {
          ...product,
          _id: product._id.toString()
        };
      } catch (error) {
        console.error('Error converting _id to string:', error);
        return {
          ...product,
          _id: null // Или другое значение по умолчанию, если преобразование не удалось
        };
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify(productsWithStringId),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://koshka-privereda.ru", // Используем HTTPS
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Разрешенные методы
        "Access-Control-Allow-Headers": "Content-Type" // Разрешенные заголовки
      }
    };
  } catch (error) {
    console.error("Error in products function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch products" }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://koshka-privereda.ru", // Используем HTTPS
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Разрешенные методы
        "Access-Control-Allow-Headers": "Content-Type" // Разрешенные заголовки
      }
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};
