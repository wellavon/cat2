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

    const productId = event.queryStringParameters.id; // Получаем ID продукта из query parameters

    if (!productId) {
      return {
        statusCode: 400, // Bad Request
        body: JSON.stringify({ message: 'Product ID is required' }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://koshka-privereda.ru",
          "Access-Control-Allow-Methods": "DELETE, OPTIONS",
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
          "Access-Control-Allow-Origin": "https://koshka-privereda.ru",
          "Access-Control-Allow-Methods": "DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      };
    }

    const result = await collection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return {
        statusCode: 404, // Not Found
        body: JSON.stringify({ message: 'Product not found' }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://koshka-privereda.ru",
          "Access-Control-Allow-Methods": "DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Product deleted successfully" }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://koshka-privereda.ru",
        "Access-Control-Allow-Methods": "DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
        }
      };
    } catch (error) {
        console.error('Error deleting product:', error);
        return {
          statusCode: 500, // Internal Server Error
          body: JSON.stringify({ message: 'Failed to delete product', error: error.message }),
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "https://koshka-privereda.ru",
            "Access-Control-Allow-Methods": "DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
          }
        };
      } finally {
        if (client) {
          await client.close();
        }
      }
    };
