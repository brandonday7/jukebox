import { Db, MongoClient } from "mongodb";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } from "../config.ts";

const URI = `${DB_HOST}://${DB_USER}:${DB_PASSWORD}@juke-cluster.hiuzhwi.mongodb.net/?retryWrites=true&w=majority&appName=juke-cluster`;
let CLIENT: MongoClient | undefined = undefined;
let DB: Db | undefined = undefined;

const connect = async () => {
  CLIENT = new MongoClient(URI);

  try {
    console.log("Connecting to database...");
    await CLIENT.connect();
    DB = CLIENT.db(DB_NAME);
    console.log("Connected to database!");
  } catch (e) {
    console.error(e);
  }
};

export const disconnect = async () => {
  if (CLIENT) {
    await CLIENT.close();
    console.log("Disconnected from database!");
  }
};

export const printCatalogs = async () => {
  if (DB) {
    const catalogs = await DB.collection("catalogs").find().toArray();
    console.log("Catalogs: ", catalogs);
  }
};

export default connect;
