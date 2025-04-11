// app/components/MapClient.tsx
import { useState, useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, Popup, useMap } from "react-leaflet";
import type { LatLngExpression, Layer, StyleFunction } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Feature, Geometry } from "geojson";

// Define GeoJSON types
interface GeoJsonProperties {
  country_code: string;
  country: string;
  province_code: string;
  province: string;
  regency_code: string;
  regency: string;
  district_code: string;
  district: string;
  village_code: string;
  village: string;
  source: string;
  date: string;
  valid_on: string;
}

interface GeoJsonGeometry {
  type: string;
  coordinates: number[][][][];
}

interface GeoJsonFeature {
  type: string;
  properties: GeoJsonProperties;
  geometry: GeoJsonGeometry;
}

interface GeoJsonData {
  type: string;
  name: string;
  crs: {
    type: string;
    properties: {
      name: string;
    };
  };
  features: GeoJsonFeature[];
}

// Component to automatically fit the map to the GeoJSON bounds
interface FitBoundsProps {
  data: GeoJsonData | null;
}

const FitBoundsToData: React.FC<FitBoundsProps> = ({ data }) => {
  const map = useMap();

  useEffect(() => {
    if (data && data.features && data.features.length > 0) {
      try {
        const geoJsonLayer = L.geoJSON(data as any);
        const bounds = geoJsonLayer.getBounds();
        map.fitBounds(bounds);
      } catch (err) {
        console.error("Error fitting bounds:", err);
      }
    }
  }, [data, map]);

  return null;
};

const getColorForRegency = (regency: string): string => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
    "#FF9999",
    "#77DD77",
    "#AEC6CF",
    "#FDFD97",
    "#836953",
    "#B39EB5",
    "#FFB347",
  ];
  const hash = regency
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const MapClient: React.FC = () => {
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] =
    useState<GeoJsonProperties | null>(null);
  const [popupPosition, setPopupPosition] = useState<LatLngExpression | null>(
    null
  );
  const geoJsonLayerRef = useRef<any>(null);
  const [selectedRegency, setSelectedRegency] = useState<string | null>(null);
  const [regenciesList, setRegenciesList] = useState<string[]>([]);

  // Fetch GeoJSON data
  useEffect(() => {
    const fetchGeoJson = async () => {
      try {
        setLoading(true);
        const response = await fetch("/app/data/jawa_tengah_district.geojson");

        if (!response.ok) {
          throw new Error(`Failed to fetch GeoJSON: ${response.status}`);
        }

        const data: GeoJsonData = await response.json();
        setGeoJsonData(data);
      } catch (err) {
        const error = err as Error;
        console.error("Error loading GeoJSON data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGeoJson();
  }, []);

  useEffect(() => {
    if (geoJsonData) {
      const regencies = Array.from(
        new Set(geoJsonData.features.map((f) => f.properties.regency))
      ).sort();
      setRegenciesList(regencies);
    }
  }, [geoJsonData]);

  const filteredGeoJsonData = useMemo(() => {
    if (!geoJsonData) return null;
    if (!selectedRegency) return geoJsonData;

    return {
      ...geoJsonData,
      features: geoJsonData.features.filter(
        (f) => f.properties.regency === selectedRegency
      ),
    };
  }, [geoJsonData, selectedRegency]);

  // Style function for GeoJSON features
  const getFeatureStyle: StyleFunction = (feature) => {
    const regency = feature?.properties?.regency;
    return {
      fillColor: regency ? getColorForRegency(regency) : "#aaaaaa",
      weight: 1,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: 0.7,
    };
  };
  useEffect(() => {
    setSelectedFeature(null);
    setPopupPosition(null);
  }, [selectedRegency]);
  // Handle interactions with each feature
  const onEachFeature = (
    feature: Feature<Geometry, GeoJsonProperties>,
    layer: L.Layer
  ) => {
    layer.on({
      click: (e) => {
        const target = e.target as L.Polygon;
        const center = target.getBounds().getCenter();
        setPopupPosition([center.lat, center.lng]);
        setSelectedFeature(feature.properties);

        if (geoJsonLayerRef.current) {
          geoJsonLayerRef.current.resetStyle();
          target.setStyle({
            weight: 4,
            color: "#fff",
            fillColor: "#ff7800",
            fillOpacity: 0.7,
          });
        }
      },
    });
  };

  // Get random coordinates from Jawa Tengah as default center
  const defaultCenter: LatLngExpression = [-7.150975, 110.140259]; // Somewhere in Central Java

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
          <div className="text-xl font-bold">Loading GeoJSON data...</div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
          <div className="text-xl font-bold text-red-600">
            Error loading GeoJSON: {error}
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-md">
        <select
          value={selectedRegency || ""}
          onChange={(e) => setSelectedRegency(e.target.value || null)}
          className="p-2 border rounded-md min-w-[200px] text-sm text-black"
        >
          <option value="">Semua Kabupaten</option>
          {regenciesList.map((regency) => (
            <option key={regency} value={regency}>
              {regency}
            </option>
          ))}
        </select>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={8}
        scrollWheelZoom={true}
        className="leaflet-container mx-auto"
        style={{ height: "80vh", width: "80%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {filteredGeoJsonData && (
          <>
            <GeoJSON
              data={filteredGeoJsonData as any}
              style={getFeatureStyle}
              onEachFeature={onEachFeature}
              ref={geoJsonLayerRef}
            />
            <FitBoundsToData data={filteredGeoJsonData} />
          </>
        )}

        {popupPosition && selectedFeature && (
          <Popup
            position={popupPosition}
            eventHandlers={{
              remove: () => {
                setSelectedFeature(null);
                setPopupPosition(null);
                if (geoJsonLayerRef.current) {
                  geoJsonLayerRef.current.resetStyle();
                }
              },
            }}
          >
            <div className="p-2">
              <h3 className="text-lg font-bold mb-2">
                {selectedFeature.village}
              </h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="font-semibold pr-2">Desa:</td>
                    <td>{selectedFeature.village}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-2">Kecamatan:</td>
                    <td>{selectedFeature.district}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-2">Kabupaten:</td>
                    <td>{selectedFeature.regency}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-2">Provinsi:</td>
                    <td>{selectedFeature.province}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
};

export default MapClient;
