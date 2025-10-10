import { Db, MongoClient } from "mongodb";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } from "../config.ts";
import type { Playable } from "./schema.ts";
import { pretty } from "../lib/helpers.ts";

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

export const findCatalogs = async (log?: boolean) => {
  if (db) {
    const catalogs = await db.collection("catalogs").find().toArray();

    if (log) {
      console.log("Catalogs: ", catalogs);
      console.log(pretty(catalogs));
    }
    return catalogs;
  }
};

export const findCatalog = async (title: string, log?: boolean) => {
  if (db) {
    const catalog = await db.collection("catalogs").findOne({ title });

    if (catalog) {
      if (log) {
        console.log(pretty(catalog));
      }

      return catalog;
    }

    console.log(`Catalog with name '${title}' not found!`);
  }
};

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

export const insertPlayable = async (
  title: string,
  playable: Playable,
  index?: number
) => {
  const catalog = await findCatalog(title);

  if (catalog) {
    if (catalog.playables.find((p) => p.spId === playable.spId)) {
      console.log(
        `Playable entry '${playable.title}', spId: '${playable.spId}' already exists! No changes have been made.`
      );
      return;
    }
    const newPlayables = catalog.playables;
    newPlayables.splice(index, 0, playable);

    await createOrUpdateCatalog(title, newPlayables);
  } else {
    console.log(
      `Catalog entry with title '${title}' not found! No changes have been made.`
    );
  }
};

export const removeFromCatalog = async (catalogTitle: string, spId: string) => {
  const catalog = await findCatalog(catalogTitle);

  if (catalog) {
    const newPlayables = catalog.playables.filter(
      (playable) => playable.spId !== spId
    );

    if (newPlayables.length === catalog.playables.length) {
      console.log(
        `Playable entry with spId '${spId}' not found! No changes have been made.`
      );
      return;
    }

    await createOrUpdateCatalog(catalogTitle, newPlayables);
  } else {
    console.log(
      `Catalog entry with title '${catalogTitle}' not found! No changes have been made.`
    );
  }
};

export const removeCatalog = async (title: string) => {
  const deleted = await db.collection("catalogs").deleteOne({ title });

  if (deleted.deletedCount === 1) {
    console.log(`Successfully deleted '${title}' catalog!`);
  } else {
    console.log(`No catalog '${title}' found! No changes have been made.`);
  }
};

export default connect;
