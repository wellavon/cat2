const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

exports.handler = async (event, context) => {
  let client;

  // Обработка OPTIONS запроса (CORS preflight)
  if (event.httpMethod === "OPTIONS") {
    console.log("Handling OPTIONS request"); // Логгирование
    return {
      statusCode: 204, // 204 No Content для OPTIONS запроса
      headers: {
        "Access-Control-Allow-Origin": "https://koshka-privereda.ru", // Или "*" для разработки
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400" // Кэширование preflight запроса на 24 часа (в секундах)
      },
      body: ""
    };
  }

  try {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('products');

    if (event.httpMethod === "POST") { // Проверка, что это POST запрос
      const product = JSON.parse(event.body);

      const result = await collection.insertOne(product);
      const insertedProduct = await collection.findOne({ _id: result.insertedId });

      let insertedProductWithStringId = null;
      if (insertedProduct && insertedProduct._id) {
        insertedProductWithStringId = {
          ...insertedProduct,
          _id: insertedProduct._id.toString()
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify(insertedProductWithStringId),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://koshka-privereda.ru", // Или "*" для разработки
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      };
    } else { // Если не POST, возвращаем 405
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method Not Allowed" }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://koshka-privereda.ru", // Или "*" для разработки
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      };
    }

  } catch (error) {
    console.error('Error adding product:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to add product', error: error.message }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://koshka-privereda.ru", // Или "*" для разработки
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};
