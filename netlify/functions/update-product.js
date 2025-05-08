const { MongoClient, ObjectId } = require('mongodb');

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

    const productId = event.queryStringParameters.id; // Получаем ID продукта из query parameters
    const updatedProduct = JSON.parse(event.body); // Получаем данные для обновления из тела запроса

    if (!productId) {
      return {
        statusCode: 400, // Bad Request
        body: JSON.stringify({ message: 'Product ID is required' }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://koshka-privereda.ru",
          "Access-Control-Allow-Methods": "PUT, OPTIONS", // Используем PUT для обновления
          "Access-Control-Allow-Headers": "Content-Type"
        }
      };
    }

    let objectId;
    try {
      objectId = new ObjectId(productId); // Используем ObjectId для поиска по _id
    } catch (error) {
      console.error('Invalid product ID:', productId);
      return {
        statusCode: 400, // Bad Request
        body: JSON.stringify({ message: 'Invalid product ID' }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://koshka-privereda.ru",
          "Access-Control-Allow-Methods": "PUT, OPTIONS", // Используем PUT для обновления
          "Access-Control-Allow-Headers": "Content-Type"
        }
      };
    }

    const result = await collection.updateOne(
      { _id: objectId }, // Используем ObjectId для поиска по _id
      { $set: updatedProduct } // Обновляем поля
    );

    if (result.modifiedCount === 0) {
      return {
        statusCode: 404, // Not Found
        body: JSON.stringify({ message: 'Product not found' }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://koshka-privereda.ru",
          "Access-Control-Allow-Methods": "PUT, OPTIONS", // Используем PUT для обновления
          "Access-Control-Allow-Headers": "Content-Type"
        }
      };
    }

    // Получаем обновленный продукт из базы данных
    const updatedProductFromDB = await collection.findOne({ _id: objectId });

    if (!updatedProductFromDB) { // Проверка, что продукт действительно найден после обновления
      return {
        statusCode: 500, // Internal Server Error - Unexpected state
        body: JSON.stringify({ message: 'Failed to retrieve updated product from database' }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://koshka-privereda.ru",
          "Access-Control-Allow-Methods": "PUT, OPTIONS", // Используем PUT для обновления
          "Access-Control-Allow-Headers": "Content-Type"
        }
      };
    }

    // Преобразуем _id в строку
    const updatedProductWithStringId = {
      ...updatedProductFromDB,
      _id: updatedProductFromDB._id.toString()
    };

    return {
      statusCode: 200,
      body: JSON.stringify(updatedProductWithStringId), // Возвращаем обновленный продукт
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://koshka-privereda.ru",
        "Access-Control-Allow-Methods": "PUT, OPTIONS", // Используем PUT для обновления
        "Access-Control-Allow-Headers": "Content-Type"
      }
    };
  } catch (error) {
    console.error('Error updating product:', error);
    return {
      statusCode: 500, // Internal Server Error
      body: JSON.stringify({ message: 'Failed to update product', error: error.message }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://koshka-privereda.ru",
        "Access-Control-Allow-Methods": "PUT, OPTIONS", // Используем PUT для обновления
        "Access-Control-Allow-Headers": "Content-Type"
      }
    };
  } finally {
    if (client) {
      try {
        await client.close(); // Добавим обработку ошибок при закрытии соединения
      } catch (closeError) {
        console.error('Error closing MongoDB connection:', closeError);
      }
    }
  }
};
