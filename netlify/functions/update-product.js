const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

exports.handler = async (event, context) => {
  let client;

  try {
    client = new MongoClient(uri, { // Убираем const
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // tlsAllowInvalidCertificates: true // ТОЛЬКО ДЛЯ ЛОКАЛЬНОЙ ОТЛАДКИ! УДАЛИТЬ ПЕРЕД ДЕПЛОЕМ В PRODUCTION
    });
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('products');

    const productId = event.queryStringParameters.id;
    const updatedProduct = JSON.parse(event.body);

    if (!productId) {
      return {
        statusCode: 400, // Bad Request
        body: JSON.stringify({ message: 'Product ID is required' }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://koshka-privereda.ru",
          "Access-Control-Allow-Methods": "PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      };
    }

    let objectId;
    try {
      objectId = new ObjectId(productId);
    } catch (error) {
      console.error('Invalid product ID:', productId);
      return {
        statusCode: 400, // Bad Request
        body: JSON.stringify({ message: 'Invalid product ID' }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://koshka-privereda.ru",
          "Access-Control-Allow-Methods": "PUT, OPTIONS", // Используем PUT для обновления
          "Access-Control-Allow-Headers": "Content-Type"
        }
      };
    }

    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updatedProduct }
    );

    if (result.modifiedCount === 0) {
      return {
        statusCode: 404, // Not Found
        body: JSON.stringify({ message: 'Product not found' }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://koshka-privereda.ru",
          "Access-Control-Allow-Methods": "PUT, OPTIONS", // Используем PUT для обновления
          "Access-Control-Allow-Headers": "Content-Type"
        }
      };
    }
    const updatedProductFromDB = await collection.findOne({ _id: objectId });

    if (!updatedProductFromDB) { // Проверка, что продукт действительно найден после обновления
      return {
        statusCode: 500, // Internal Server Error - Unexpected state
        body: JSON.stringify({ message: 'Failed to retrieve updated product from database' }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://koshka-privereda.ru",
          "Access-Control-Allow-Methods": "PUT, OPTIONS", // Используем PUT для обновления
          "Access-Control-Allow-Headers": "Content-Type"
        }
      };
    }
    const updatedProductWithStringId = {
      ...updatedProductFromDB,
      _id: updatedProductFromDB._id.toString()
    };

    return {
      statusCode: 200,
      body: JSON.stringify(updatedProductWithStringId),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://koshka-privereda.ru",
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
        "Access-Control-Allow-Origin": "https://koshka-privereda.ru",
        "Access-Control-Allow-Methods": "PUT, OPTIONS", // Используем PUT для обновления
        "Access-Control-Allow-Headers": "Content-Type"
      }
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};
