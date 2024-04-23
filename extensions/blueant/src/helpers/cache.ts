import { Cache as RaycastCache } from "@raycast/api";
import { getDateString, isToday } from "~/helpers/dates";

export const Cache = new RaycastCache({ namespace: 'blueant' });

/* Specific cache helpers below */

export const cachePreviousComment = (message: string) => {
  Cache.set("previousComment", getDateString(new Date()) + message);
};

export const getCachedPreviousComment = () => {
  const cachedValue = Cache.get("previousComment");
  if (!cachedValue) return null;

  const date = new Date(cachedValue.substring(0, 10));
  if (!isToday(date)) return null;
  return cachedValue.substring(10);
};