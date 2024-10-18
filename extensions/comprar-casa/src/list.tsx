import { useState } from "react";
import { ActionPanel, Action, Icon, Grid } from "@raycast/api";
import { Agencies, Listing } from "./api/api.types";
import { useFetchListings } from "./api";
import { useCachedState } from "@raycast/utils";

const columns = [3, 5, 8];

export default function ListCommand() {
  const [columnsIndex, setColumnsIndex] = useCachedState("columnsIndex", 0);
  const [agency, setAgency] = useCachedState<Agencies>("agency", "remax");
  const { data, isLoading, pagination, revalidate } = useFetchListings(agency);

  console.log(pagination)

  return (
    <Grid
      columns={columns[columnsIndex]}
      inset={Grid.Inset.Zero}
      isLoading={isLoading}
      fit={Grid.Fit.Contain}
      pagination={pagination}
      searchBarAccessory={
        <Grid.Dropdown tooltip="Agency" storeValue onChange={(value) => setAgency(value as Agencies)}>
          <Grid.Dropdown.Item title="Remax" value="remax" />
          <Grid.Dropdown.Item title="Idealista" value="idealista" />
          <Grid.Dropdown.Item title="Imoveis+" value="imoveisMais" />
          <Grid.Dropdown.Item title="Imovirtual" value="imovirtual" />
        </Grid.Dropdown>
      }
    >
      <Grid.EmptyView
        title="No listings found"
        icon={Icon.QuestionMarkCircle}
        actions={
          <Action
            title="Refresh Listings"
            icon={Icon.ArrowClockwise}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
            onAction={revalidate}
          />
        }
      />
      {data?.map((listing) => (
        <GridItem
          key={listing.id}
          listing={listing}
          onColumnsChange={() => setColumnsIndex((index) => (index + 1) % columns.length)}
          onRefresh={revalidate}
        />
      ))}
    </Grid>
  );
}

type GridItemProps = {
  listing: Listing;
  onColumnsChange: () => void;
  onRefresh: () => void;
};

function GridItem(props: GridItemProps) {
  const { listing, onColumnsChange, onRefresh } = props;
  const [imageIndex, setImageIndex] = useState(0);

  const pictureCount = listing.images?.length ?? 0;
  const image = listing.images?.[imageIndex] ?? listing.image;

  return (
    <Grid.Item
      key={listing.id}
      content={{ source: image ?? Icon.Image, fallback: Icon.Image }}
      title={listing.title}
      subtitle={`${listing.price} ${listing.location ?? ''}`}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url={listing.url} />
          {pictureCount > 1 && (
            <>
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
            </>
          )}
          <ActionPanel.Section title="List Actions">
            <Action
              title="Refresh Listings"
              icon={Icon.ArrowClockwise}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
              onAction={onRefresh}
            />
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
