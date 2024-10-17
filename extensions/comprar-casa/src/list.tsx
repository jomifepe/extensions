import { useState } from "react";
import { ActionPanel, Action, Icon, Grid } from "@raycast/api";
import { Agencies, Listing } from "./api/api.types";
import { useFetchListings } from "./api";
import { useCachedState } from "@raycast/utils";

type GridItemProps = {
  listing: Listing;
  onColumnsChange: () => void;
};

function GridItem(props: GridItemProps) {
  const { listing, onColumnsChange } = props;
  const [imageIndex, setImageIndex] = useState(0);

  const pictureCount = listing.images.length;

  return (
    <Grid.Item
      key={listing.id}
      content={{ source: listing.images[imageIndex], fallback: Icon.Image }}
      title={listing.title}
      subtitle={`${listing.price} ${listing.location}`}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url={listing.url} />
          <Action
            title="Next Image"
            icon={Icon.ArrowRight}
            shortcut={{ modifiers: ["cmd"], key: "arrowRight" }}
            onAction={() => setImageIndex((imageIndex + 1) % pictureCount)}
          />
          <Action
            title="Previous Image"
            icon={Icon.ArrowLeft}
            shortcut={{ modifiers: ["cmd"], key: "arrowLeft" }}
            onAction={() => setImageIndex((imageIndex - 1 + pictureCount) % pictureCount)}
          />
          <ActionPanel.Section title="List Actions">
            <Action
              title="Change Columns"
              icon={Icon.AppWindowGrid2x2}
              shortcut={{ modifiers: ["cmd"], key: "c" }}
              onAction={onColumnsChange}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

const columns = [3, 5, 8];

export default function Command() {
  const [columnsIndex, setColumnsIndex] = useCachedState("columnsIndex", 0);
  const [agency, setAgency] = useState<Agencies>("remax");
  const { data, isLoading } = useFetchListings(agency);

  return (
    <Grid
      columns={columns[columnsIndex]}
      inset={Grid.Inset.Small}
      isLoading={isLoading}
      fit={Grid.Fit.Fill}
      searchBarAccessory={
        <Grid.Dropdown tooltip="Agency" storeValue onChange={(value) => setAgency(value as Agencies)}>
          <Grid.Dropdown.Item title="Remax" value="remax" />
        </Grid.Dropdown>
      }
    >
      {!isLoading &&
        data?.results.map((listing) => (
          <GridItem
            key={listing.id}
            listing={listing}
            onColumnsChange={() => setColumnsIndex((index) => (index + 1) % columns.length)}
          />
        ))}
    </Grid>
  );
}
