import { useState } from "react";
import { ActionPanel, Action, Icon, Grid, Color } from "@raycast/api";
import { Agencies, Listing } from "./api/api.types";
import { useFetchListings } from "./api";
import { useCachedState } from "@raycast/utils";
import { usePagination } from "./helpers/usePagination";

const columns = [3, 5, 8];

export default function ListCommand() {
  const [columnsIndex, setColumnsIndex] = useCachedState("columnsIndex", 0);
  const columnNumber = columns[columnsIndex];

  const [agency, setAgency] = useState<Agencies>("remax");
  const { pagination, ...paginationListProps } = usePagination(columnNumber);
  const { data, listingsPageUrl, isLoading, refetch } = useFetchListings(agency, pagination);

  return (
    <Grid
      columns={columnNumber}
      inset={Grid.Inset.Zero}
      isLoading={isLoading}
      fit={Grid.Fit.Contain}
      searchBarAccessory={
        <Grid.Dropdown tooltip="Agency" storeValue onChange={(value) => setAgency(value as Agencies)}>
          <Grid.Dropdown.Item title="Remax" value="remax" />
          <Grid.Dropdown.Item title="Idealista" value="idealista" />
          <Grid.Dropdown.Item title="Imoveis+" value="imoveisMais" />
          <Grid.Dropdown.Item title="Imovirtual" value="imovirtual" />
          <Grid.Dropdown.Item title="Supercasa" value="supercasa" />
          <Grid.Dropdown.Item title="BPI Expresso" value="bpiExpresso" />
          <Grid.Dropdown.Item title="Angariax" value="angariax" />
        </Grid.Dropdown>
      }
      {...paginationListProps}
    >
      <Grid.EmptyView
        title="No listings found"
        icon={Icon.QuestionMarkCircle}
        actions={
          <Action
            title="Refresh Listings"
            icon={Icon.ArrowClockwise}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
            onAction={refetch}
          />
        }
      />
      {data?.map((listing) => (
        <GridItem
          key={listing.id}
          listing={listing}
          listingsPageUrl={listingsPageUrl}
          onColumnsChange={() => setColumnsIndex((index) => (index + 1) % columns.length)}
          onRefresh={refetch}
        />
      ))}
    </Grid>
  );
}

type GridItemProps = {
  listing: Listing;
  onColumnsChange: () => void;
  onRefresh: () => void;
  listingsPageUrl?: string;
};

function GridItem(props: GridItemProps) {
  const { listing, onColumnsChange, onRefresh, listingsPageUrl } = props;
  const [imageIndex, setImageIndex] = useState(0);

  const pictureCount = listing.images?.length ?? 0;
  let image = listing.image ?? listing.images?.[imageIndex];
  if (listing.images && imageIndex > 0) {
    image = listing.images[imageIndex];
  }

  return (
    <Grid.Item
      id={listing.id}
      key={listing.id}
      content={{ source: image ?? Icon.Image, fallback: Icon.Image }}
      title={listing.title}
      subtitle={`${listing.price} ${listing.location ?? ""}`}
      accessory={
        listing.isSoldOrReserved
          ? { icon: { source: Icon.CircleDisabled, tintColor: Color.Red }, tooltip: "Sold or reserved" }
          : undefined
      }
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url={listing.url} />
          {!!listingsPageUrl && <Action.OpenInBrowser title="Open Listings Page" url={listingsPageUrl} />}
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
