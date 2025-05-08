const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

exports.handler = async (event, context) => {
  let client;

  // Handle OPTIONS request (CORS preflight)
  if (event.httpMethod === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400"
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

    if (event.httpMethod !== "DELETE") {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: 'Method Not Allowed' }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      };
    }

    const productId = event.queryStringParameters.id;

    if (!productId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Product ID is required' }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "DELETE, OPTIONS",
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
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid product ID' }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      };
    }

    const result = await collection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Product not found' }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
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
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    };
  } catch (error) {
    console.error('Error deleting product:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to delete product', error: error.message }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
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

