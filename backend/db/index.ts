import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } from "../config.ts";
import {
  SpAccount,
  Vibe,
  type PlayableData,
  type SpAccountData,
} from "./schema.ts";
import { isDefined, logError, pretty } from "../lib/helpers.ts";
import mongoose from "mongoose";

const URI = `${DB_HOST}://${DB_USER}:${DB_PASSWORD}@juke-cluster.hiuzhwi.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=juke-cluster`;

export const connect = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(URI, { bufferCommands: false });
  } catch (error) {
    logError(error);
  }
};

export const disconnect = async () => {
  console.log("Closing database connection...");
  await mongoose.disconnect();
};

mongoose.connection.on("connected", () =>
  console.log("Connected to database!")
);

mongoose.connection.on("disconnected", () =>
  console.log("Disconnected from database!")
);

export const findVibes = async (log?: boolean) => {
  const vibes = await Vibe.find();

  if (log) {
    console.log(pretty(vibes));
  }
  return vibes;
};

export const findVibe = async (title: string, log?: boolean) => {
  const vibe = await Vibe.findOne({ title });

  if (vibe) {
    if (log) {
      console.log(pretty(vibe));
    }

    return vibe;
  }

  console.log(`Vibe with name '${title}' not found!`);
};

export const createOrUpdateVibe = async (
  title: string,
  playables?: PlayableData[],
  hidden?: boolean
) => {
  if (!playables && !hidden) {
    console.log(`Nothing to update in ${title}.`);
    return;
  }

  try {
    const filter = { title };
    const toUpdate = {
      ...(isDefined(playables) ? { playables } : {}),
      ...(isDefined(hidden) ? { hidden } : {}),
    };
    const options = { upsert: true, new: true };
    const vibe = await Vibe.findOneAndUpdate(filter, toUpdate, options);
    return vibe;
  } catch (error) {
    logError(error);
  }
};

export const insertPlayable = async (
  title: string,
  playable: PlayableData,
  index?: number
) => {
  const vibe = await findVibe(title);

  if (vibe) {
    const newPlayables = vibe.playables;
    newPlayables.splice(index || newPlayables.length, 0, playable);
    vibe.playables = newPlayables;
    await vibe.save();
  } else {
    console.log(
      `Vibe entry with title '${title}' not found! No changes have been made.`
    );
  }
};

export const removePlayable = async (vibeTitle: string, spId: string) => {
  const vibe = await findVibe(vibeTitle);

  if (vibe) {
    const initialLength = vibe.playables.length;

    vibe.playables.pull({ spId });
    await vibe.save();

    if (vibe.playables.length === initialLength) {
      console.log(
        `Playable entry with spId '${spId}' not found! No changes have been made.`
      );
      return;
    }
  } else {
    console.log(
      `Vibe entry with title '${vibeTitle}' not found! No changes have been made.`
    );
  }
};

export const removeVibe = async (title: string) => {
  const deleted = await Vibe.deleteOne({ title });

  if (deleted.deletedCount === 1) {
    console.log(`Successfully deleted '${title}' vibe!`);
  } else {
    console.log(`No vibe '${title}' found! No changes have been made.`);
  }
};

export const createOrUpdateSpAccount = async (account: SpAccountData) => {
  const filter = { userName: account.userName };
  const toUpdate = {
    accessToken: account.accessToken,
    refreshToken: account.refreshToken,
    expiresAt: account.expiresAt,
  };
  const options = { upsert: true, new: true };

  try {
    await SpAccount.findOneAndUpdate(filter, toUpdate, options);
  } catch (error) {
    console.log(pretty(error));
  }
};

export const getSpAccount = async (userName: string) => {
  const spAccount = await SpAccount.findOne({ userName });

  if (spAccount) {
    return spAccount;
  } else {
    console.log(`No account with name: ${userName} found!`);
  }
};
