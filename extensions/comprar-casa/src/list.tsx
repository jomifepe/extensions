import { useState } from "react";
import { ActionPanel, Action, Icon, Grid } from "@raycast/api";
import { Listing } from "./api/api.types";
import { useFetchListings } from "./api";

type GridItemProps = {
  listing: Listing;
};

function GridItem(props: GridItemProps) {
  const { listing } = props;
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
        </ActionPanel>
      }
    />
  );
}

export default function Command() {
  const [columns, setColumns] = useState(5);
  const { data, isLoading } = useFetchListings("remax");

  return (
    <Grid
      columns={columns}
      inset={Grid.Inset.Small}
      isLoading={isLoading}
      fit={Grid.Fit.Fill}
      searchBarAccessory={
        <Grid.Dropdown tooltip="Grid Item Size" storeValue onChange={(newValue) => setColumns(parseInt(newValue))}>
          <Grid.Dropdown.Item title="Large" value={"3"} />
          <Grid.Dropdown.Item title="Medium" value={"5"} />
          <Grid.Dropdown.Item title="Small" value={"8"} />
        </Grid.Dropdown>
      }
    >
      {!isLoading && data?.results.map((listing) => <GridItem key={listing.id} listing={listing} />)}
    </Grid>
  );
}
