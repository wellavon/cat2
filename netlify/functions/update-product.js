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
        "Access-Control-Allow-Methods": "PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "PUT") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
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

    const productId = event.queryStringParameters.id;
    const updatedProduct = JSON.parse(event.body);

    if (!productId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Product ID is required' }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
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
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid product ID' }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "PUT, OPTIONS",
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
        statusCode: 404,
        body: JSON.stringify({ message: 'Product not found' }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      };
    }

    const updatedProductFromDB = await collection.findOne({ _id: objectId });

    if (!updatedProductFromDB) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Failed to retrieve updated product from database' }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "PUT, OPTIONS",
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
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    };
  } catch (error) {
    console.error('Error updating product:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to update product', error: error.message }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};

