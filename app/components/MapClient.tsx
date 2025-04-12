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
  prevalensi_stunting: number | null;
  prevalensi_wasting: number | null;
  prevalensi_underweight: number | null;
  status: string;
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

// interface StuntingData {
//   KABUPATEN: string;
//   PREVALENSI: string; // atau bisa diubah ke number
//   target: string; // bisa juga number kalau kamu perlukan
// }

interface DataGizi {
  Kabupaten_Kota: string;
  STATUS_GIZI: {
    Prev_Stunting: number;
    Prev_Wasting: number;
    Prev_Underweight: number;
  };
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
  // const [stuntingData, setStuntingData] = useState<StuntingData[]>([]);
  const [dataGizi, setDataGizi] = useState<DataGizi[]>([]);

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

  // Fetch stunting data
  // useEffect(() => {
  //   const fetchStuntingData = async () => {
  //     try {
  //       const response = await fetch("/app/data/data_stunting_2024.json");

  //       if (!response.ok) {
  //         throw new Error(`Failed to fetch stunting data: ${response.status}`);
  //       }

  //       const data: StuntingData[] = await response.json();
  //       setStuntingData(data);
  //     } catch (err) {
  //       const error = err as Error;
  //       console.error("Error loading stunting data:", error);
  //     }
  //   };

  //   fetchStuntingData();
  // }, []);

  // fetch data gizi
  useEffect(() => {
    const fetchDataGizi = async () => {
      try {
        const response = await fetch("/app/data/gizi_indonesia_2024.json");

        if (!response.ok) {
          throw new Error(`Failed to fetch data gizi: ${response.status}`);
        }

        const data: DataGizi[] = await response.json();
        setDataGizi(data);
      } catch (err) {
        const error = err as Error;
        console.error("Error loading data gizi:", error);
      }
    };

    fetchDataGizi();
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

        if (geoJsonLayerRef.current) {
          geoJsonLayerRef.current.resetStyle();
          target.setStyle({
            weight: 4,
            color: "#fff",
            fillColor: "#ff7800",
            fillOpacity: 0.7,
          });
        }
        const regencyName = feature.properties.regency.toUpperCase(); // pastikan uppercase match
        // const data = stuntingData.find(
        //   (item) => item.KABUPATEN === regencyName
        // );

        const data = dataGizi.find(
          (item) =>
            item.Kabupaten_Kota &&
            item.Kabupaten_Kota.replace(/^(KAB)\s+/i, "").toUpperCase() ===
              regencyName.toUpperCase()
        );

        if (data) {
          const prevalensi_stunting = data.STATUS_GIZI.Prev_Stunting;
          const prevalensi_wasting = data.STATUS_GIZI.Prev_Wasting;
          const prevalensi_underweight = data.STATUS_GIZI.Prev_Underweight;
          const status =
            prevalensi_stunting * 0.5 +
            prevalensi_wasting * 0.3 +
            prevalensi_underweight * 0.2;

          feature.properties.prevalensi_stunting = prevalensi_stunting;
          feature.properties.prevalensi_wasting = prevalensi_wasting;
          feature.properties.prevalensi_underweight = prevalensi_underweight;

          console.log(status);

          if (status >= 15) {
            feature.properties.status =
              status.toFixed(3) + " \nTINGGI (DARURAT)";
          } else if (status >= 10) {
            feature.properties.status =
              status.toFixed(3) + " \nSEDANG (WASPADA)";
          } else {
            feature.properties.status = status.toFixed(3) + " \nRENDAH (AMAN)";
          }
          setSelectedFeature(feature.properties);
        } else
          console.log(`No stunting data found for regency: ${regencyName}`);
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
                {selectedFeature.regency} - {selectedFeature.village}
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
                  <tr>
                    <td className="font-semibold pr-2">Prevalensi Stunting:</td>
                    <td>{selectedFeature.prevalensi_stunting}%</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-2">Prevalensi Wasting:</td>
                    <td>{selectedFeature.prevalensi_wasting}%</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-2">
                      Prevalensi Underweight:
                    </td>
                    <td>{selectedFeature.prevalensi_underweight}%</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-2">STATUS PRIORITAS:</td>
                    {selectedFeature.status.includes("DARURAT") ? (
                      <td className="text-red-500 font-bold">
                        {selectedFeature.status}
                      </td>
                    ) : selectedFeature.status.includes("WASPADA") ? (
                      <td className="text-yellow-500 font-bold">
                        {selectedFeature.status}
                      </td>
                    ) : (
                      <td className="text-green-500 font-bold">
                        {selectedFeature.status}
                      </td>
                    )}
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
