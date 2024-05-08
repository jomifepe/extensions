import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { Bitwarden } from "~/api/bitwarden";
import { LoadingFallback } from "~/components/LoadingFallback";
import TroubleshootingGuide from "~/components/TroubleshootingGuide";
import { captureException } from "~/utils/development";

const BitwardenContext = createContext<Bitwarden | null>(null);

export type BitwardenProviderProps = PropsWithChildren<{
  loadingFallback?: JSX.Element;
}>;

export const BitwardenProvider = ({ children, loadingFallback = <LoadingFallback /> }: BitwardenProviderProps) => {
  const [bitwarden, setBitwarden] = useState<Bitwarden>();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    void new Bitwarden().initialize().then(setBitwarden).catch(handleBwInitError);
  }, []);

  function handleBwInitError(error: Error) {
    captureException("Failed to initialize bitwarden", error);
    setError(error);
  }

  if (error) return <TroubleshootingGuide error={error} />;
  if (!bitwarden) return loadingFallback;

  return <BitwardenContext.Provider value={bitwarden}>{children}</BitwardenContext.Provider>;
};

export const useBitwarden = () => {
  const context = useContext(BitwardenContext);
  if (context == null) {
    throw new Error("useBitwarden must be used within a BitwardenProvider");
  }

  return context;
};

export default BitwardenContext;
