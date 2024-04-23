import { getPreferenceValues, Toast } from "@raycast/api";
import { Page } from "puppeteer";

export const login = async (page: Page, toast?: Toast) => {
  const { username, password } = getPreferenceValues<Preferences>();

  !!toast && (toast.message = "Logging in");
  await page.type('[name="MT_BENUTZERNAME"]', username);
  await page.type('[name="MT_Kennwort"]', password);
  await page.click('input[type="submit"]');
};
