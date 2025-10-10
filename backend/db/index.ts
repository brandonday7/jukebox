import { Db, MongoClient } from "mongodb";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } from "../config.ts";
import type { Playable } from "./schema.ts";

const URI = `${DB_HOST}://${DB_USER}:${DB_PASSWORD}@juke-cluster.hiuzhwi.mongodb.net/?retryWrites=true&w=majority&appName=juke-cluster`;
const CATALOGS = "catalogs";
let client: MongoClient | undefined = undefined;
let db: Db | undefined = undefined;

const connect = async () => {
  client = new MongoClient(URI);

  try {
    console.log("Connecting to database...");
    await client.connect();
    db = client.db(DB_NAME);
    console.log("Connected to database!");
  } catch (e) {
    console.error(e);
  }
};

export const disconnect = async () => {
  if (client) {
    await client.close();
    console.log("Disconnected from database!");
  }
};

export const printCatalogs = async () => {
  if (db) {
    const catalogs = await db.collection("catalogs").find().toArray();
    console.log("Catalogs: ", catalogs);
  }
};

// export const printCatalog = async (title: string) => {
//   if (db) {
//     const catalog = db.collection("catalogs").find({ title });
//     console.log("******", catalog);
//   }
// };

export const createOrUpdateCatalog = async (
  title: string,
  playables: Playable[]
) => {
  if (db) {
    const catalogs = db.collection(CATALOGS);

    try {
      await catalogs.updateOne(
        { title },
        { $set: { playables } },
        {
          upsert: true,
        }
      );
    } catch (error) {
      console.log(error);
    }
  }
};

// export const insertPlayable = async (
//   title: string,
//   playable: Playable,
//   index?: number
// ) => null;

// export const removeFromCatalog = async (
//   catalogTitle: string,
//   playableTitle: string
// ) => null;

// export const removeCatalog = async (title: string) => null;

export default connect;
