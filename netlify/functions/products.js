const { MongoClient } = require('mongodb');

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
        "Access-Control-Allow-Methods": "GET, OPTIONS",
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

    if (event.httpMethod === "GET") {
      const products = await collection.find({}).toArray();

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
            _id: null
          };
        }
      });

      return {
        statusCode: 200,
        body: JSON.stringify(productsWithStringId),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      };
    } else {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method Not Allowed" }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      };
    }
  } catch (error) {
    console.error("Error in products function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch products" }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};

