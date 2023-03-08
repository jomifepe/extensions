import { ActionPanel, getPreferenceValues, Icon } from "@raycast/api";
import CopyPasswordAction from "~/components/search/actions/CopyPasswordAction";
import PastePasswordAction from "~/components/search/actions/PastePasswordAction";
import ComponentReverser from "~/components/ComponentReverser";
import CopyTotpAction from "~/components/search/actions/CopyTotpAction";
import ShowSecureNoteAction from "~/components/search/actions/ShowSecureNoteAction";
import SearchCommonActions from "~/components/search/actions/CommonActions";
import { Item } from "~/types/search";
import { capitalize } from "~/utils/strings";
import CopyUsernameAction from "~/components/search/actions/CopyUsernameAction";
import CopyWithRepromptAction from "~/components/search/actions/CopyWithRepromptAction";

const { primaryAction } = getPreferenceValues();

export type SearchItemActionsProps = {
  item: Item;
};

const SearchItemActions = (props: SearchItemActionsProps) => {
  const { item } = props;
  const { login, notes, card, identity, fields } = item;

  const fieldMap = Object.fromEntries(fields?.map((field) => [field.name, field.value]) || []);
  const uriMap = Object.fromEntries(
    login?.uris?.filter((uri) => uri.uri).map((uri, index) => [`uri${index + 1}`, uri.uri]) || []
  );

  return (
    <>
      {!!login && (
        <ActionPanel.Section>
          <ComponentReverser reverse={primaryAction === "copy"}>
            <PastePasswordAction key="paste" item={item} />
            <CopyPasswordAction key="copy" item={item} />
          </ComponentReverser>
          <CopyTotpAction item={item} />
          <CopyUsernameAction item={item} />
        </ActionPanel.Section>
      )}
      <ActionPanel.Section>{!!notes && <ShowSecureNoteAction item={item} />}</ActionPanel.Section>
      <ActionPanel.Section>
        {Object.entries({ notes, ...card, ...identity, ...fieldMap, ...uriMap }).map(([title, content], index) =>
          content ? (
            <CopyWithRepromptAction
              item={item}
              key={`${index}-${title}`}
              title={`Copy ${capitalize(title)}`}
              icon={Icon.Clipboard}
              content={content}
            />
          ) : null
        )}
      </ActionPanel.Section>
      <ActionPanel.Section>
        <SearchCommonActions />
      </ActionPanel.Section>
    </>
  );
};

export default SearchItemActions;
