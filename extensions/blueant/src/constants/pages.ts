import { getPreferenceValues } from "@raycast/api";

const { domain } = getPreferenceValues<Preferences>();

export const Pages = {
  TimeRecording: `https://${domain}/psap?p=TimeRecording&t=0`,
} as const;

export type PageUrl = (typeof Pages)[keyof typeof Pages];