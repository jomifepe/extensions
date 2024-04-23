const Pages = {
  TimeRecording: `https://${domain}/psap?p=TimeRecording&t=0`,
} as const;

type PageUrl = (typeof Pages)[keyof typeof Pages];