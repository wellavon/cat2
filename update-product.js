const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

exports.handler = async (event, context) => {
  let client;

  try {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('products');

    const productId = event.queryStringParameters.id; // Получаем ID продукта из query parameters
    const updatedProduct = JSON.parse(event.body); // Получаем данные для обновления из тела запроса

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
          "Access-Control-Allow-Origin": "*"
        }
      };
    }

    const result = await collection.updateOne(
      { _id: objectId }, // Используем ObjectId для поиска по _id
      { $set: updatedProduct } // Обновляем поля
    );

    if (result.modifiedCount === 0) {
      return { statusCode: 404, body: JSON.stringify({ message: 'Product not found' }) };
    }

    // Получаем обновленный продукт из базы данных
    const updatedProductFromDB = await collection.findOne({ _id: objectId });

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
        "Access-Control-Allow-Origin": "*"
      }
    };
  } catch (error) {
    console.error('Error updating product:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to update product' }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};