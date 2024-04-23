import { Action, ActionPanel, Detail, Toast, showToast } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { getLastRecordingComment } from "~/helpers/commands/timeRecording/getLastRecordingComment";

export default function LastRecordingCommand() {
  const { data, isLoading } = useCachedPromise(async () => {
    const toast = await showToast({ style: Toast.Style.Animated, title: "Getting comment..." });
    try {
      const message = await getLastRecordingComment(toast);
      await toast.hide();
      return message;
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to get last recording message";
      console.error('Failed to get last recording message', error)
    }
  });

  return (
    <Detail
      isLoading={isLoading}
      markdown={data}
      actions={
        <ActionPanel>
          {!!data && (
            <>
              <Action.CopyToClipboard content={data} />
              <Action.Paste content={data} />
            </>
          )}
        </ActionPanel>
      }
    />
  );
}
