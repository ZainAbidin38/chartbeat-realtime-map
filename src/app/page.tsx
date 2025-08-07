"use client";

import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { getCountryMarkers } from "@/utils/getCountryMarkers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// TypeScript interfaces
interface CountryMarker {
  name: string;
  coordinates: [number, number];
  markerOffset: number;
  userCount?: number; // Add user count 
}

interface UseCountryMarkersReturn {
  markers: CountryMarker[];
  loading: boolean;
  error: string | null;
}

function useCountryMarkers(): UseCountryMarkersReturn {
  const [markers, setMarkers] = useState<CountryMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCountryMarkers();
        setMarkers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch markers');
        console.error('Error fetching markers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkers();
  }, []);

  return { markers, loading, error };
}

export default function Home() {
  const { markers, loading, error } = useCountryMarkers();

  if (loading) {
    return (
      <div className={`${geistSans.variable} ${geistMono.variable}`} style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
        <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <div>Loading world map...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${geistSans.variable} ${geistMono.variable}`} style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
        <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: 'red' }}>
            <div>Error: {error}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Company Users - World Map</title>
        <meta name="description" content="Interactive map showing company users by country" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={`${geistSans.variable} ${geistMono.variable}`} style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
        <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ width: '100%', height: '600px', background: '#1a1a1a', borderRadius: '8px', overflow: 'hidden' }}>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 100,
                center: [0, 20]
              }}
              style={{ width: '100%', height: '100%' }}
            >
              <ZoomableGroup>
                <Geographies geography="/countries.json">
                  {({ geographies }) =>
                    geographies.map((geo: any) => (
                      <Geography 
                        key={geo.rsmKey} 
                        geography={geo}
                        fill="#2d2d2d"
                        stroke="#404040"
                        strokeWidth={0.5}
                        style={{
                          default: {
                            fill: "#2d2d2d",
                            stroke: "#404040",
                            strokeWidth: 0.5,
                            outline: "none"
                          },
                          hover: {
                            fill: "#3d3d3d",
                            stroke: "#606060",
                            strokeWidth: 0.5,
                            outline: "none"
                          },
                          pressed: {
                            fill: "#4d4d4d",
                            stroke: "#707070",
                            strokeWidth: 0.5,
                            outline: "none"
                          }
                        }}
                      />
                    ))
                  }
                </Geographies>
                {markers.map(({ name, coordinates, markerOffset, userCount }) => (
                  <Marker key={name} coordinates={coordinates}>
                    {/* Pin SVG */}
                    <g
                      fill="#ff4444"
                      stroke="#ffffff"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      transform="translate(-12, -18)"
                      style={{ cursor: 'pointer' }}
                    >
                      <circle cx="12" cy="8" r="8" fill="#ff4444" />
                      <circle cx="12" cy="8" r="3" fill="#ffffff" />
                      <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" fill="#ff4444" />
                    </g>
                    {/* Country name label */}
                    <text
                      textAnchor="middle"
                      y={markerOffset}
                      style={{ 
                        fontFamily: "system-ui", 
                        fill: "#ffffff", 
                        fontSize: "10px",
                        fontWeight: "500",
                        textShadow: "1px 1px 2px rgba(0,0,0,0.7)"
                      }}
                    >
                      {name}
                    </text>
                    {/* User count (if available) */}
                    {userCount && (
                      <text
                        textAnchor="middle"
                        y={markerOffset + 12}
                        style={{ 
                          fontFamily: "system-ui", 
                          fill: "#cccccc", 
                          fontSize: "8px",
                          textShadow: "1px 1px 2px rgba(0,0,0,0.7)"
                        }}
                      >
                        {userCount} users
                      </text>
                    )}
                  </Marker>
                ))}
              </ZoomableGroup>
            </ComposableMap>
          </div>
          <div style={{ marginTop: '20px', color: '#666', textAlign: 'center' }}>
            <p>Total countries with users: {markers.length}</p>
          </div>
        </main>
      </div>
    </>
  );
}