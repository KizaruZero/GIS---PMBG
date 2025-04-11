import { useEffect, useState } from "react";

export default function Map() {
  const [MapClient, setMapClient] = useState<React.FC | null>(null);

  useEffect(() => {
    import("../components/MapClient").then((mod) => {
      setMapClient(() => mod.default);
    });
  }, []);

  if (!MapClient) return <p>Loading map...</p>;

  return <MapClient />;
}
