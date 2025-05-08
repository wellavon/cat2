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
        "Access-Control-Allow-Origin": "*" // ВНИМАНИЕ: только для разработки! Укажите конкретный домен в production
      }
    };
  } catch (error) {
    console.error('Error retrieving products:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to retrieve products', error: error.message }),
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
