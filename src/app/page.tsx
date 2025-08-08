"use client";

import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { getCountryMarkers } from "@/utils/getCountryMarkers";
import NumberFlow, { continuous }  from "@number-flow/react";

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

const HOST_OPTIONS = [
  "abc7.com",
  "washingtonpost.com",
  "cnn.com",
  "ign.com",
  "blog.chartbeat.com",
  "aljazeera.net",
  "bbc.co.uk",
  "abcnews.go.com",
  "abc13.com",
]

function useCountryMarkers(host: string): UseCountryMarkersReturn {
  const [markers, setMarkers] = useState<CountryMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCountryMarkers(host);
        setMarkers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch markers');
        console.error('Error fetching markers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkers();
  }, [host]);

  return { markers, loading, error };
}

export default function Home() {
  const [selectedHost, setSelectedHost] = useState(HOST_OPTIONS[0]);
  const { markers, loading, error } = useCountryMarkers(selectedHost);
  // Calculate total users for display
  const totalUsers = markers.reduce((sum, marker) => sum + (marker.userCount || 0), 0);
  // To highlight active countries on the map
  const activeCountries = new Set(markers.map(marker => marker.name));
  
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
          {/* Container for dropdown and total users side by side */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between', 
            marginBottom: '24px',
            gap: '150px',
            maxWidth: '420px', 
          }}
        >
          {/* Dropdown wrapper with red translucent bubble */}
          <div
            style={{
              padding: '8px 20px',
              borderRadius: '24px',
              backgroundColor: 'rgba(255, 76, 76, 0.15)',
              boxShadow: '0 0 15px rgba(255, 76, 76, 0.4)',
              userSelect: 'none',
              whiteSpace: 'nowrap',
              fontFamily: 'system-ui, sans-serif',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#fff', // white text for label
            }}
          >
            <label
              htmlFor="host-select"
              style={{
                fontWeight: '700',
                fontSize: '20px',
                userSelect: 'none',
                color: '#fff',
                minWidth: '110px', 
              }}
            >
              Select Site:
            </label>
            <select
              id="host-select"
              value={selectedHost}
              onChange={(e) => setSelectedHost(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: '1.5px solid rgba(255, 76, 76, 0.6)',
                backgroundColor: 'rgba(255, 76, 76, 0.05)',
                color: '#fff',
                fontWeight: '600',
                fontSize: '18px',
                cursor: 'pointer',
                minWidth: '160px',
                boxShadow: '0 0 8px rgba(255, 76, 76, 0.3)',
                transition: 'background-color 0.3s ease, border-color 0.3s ease',
                appearance: 'none', // hides default arrow for cleaner look
                outline: 'none', 
                backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='white' height='12' viewBox='0 0 24 24' width='12' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '18px 18px',
                paddingRight: '36px',
              }}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 76, 76, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(255, 76, 76, 0.9)';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(255, 76, 76, 0.7)';
                e.currentTarget.style.outline = 'none';
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 76, 76, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 76, 76, 0.6)';
                e.currentTarget.style.boxShadow = '0 0 8px rgba(255, 76, 76, 0.3)';
                e.currentTarget.style.outline = 'none';
              }}
            >
              {HOST_OPTIONS.map((host) => (
                <option key={host} value={host}>
                  {host}
                </option>
              ))}
            </select>
          </div>
          {/* Total users bubble */}
          <div
            style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#fff',
              padding: '8px 20px',
              borderRadius: '24px',
              backgroundColor: 'rgba(255, 76, 76, 0.15)',
              boxShadow: '0 0 15px rgba(255, 76, 76, 0.4)',
              userSelect: 'none',
              whiteSpace: 'nowrap',
              fontFamily: 'system-ui, sans-serif',
              flexShrink: 0,
            }}
          >
            Total Active Users:{" "}
            <NumberFlow plugins={[continuous]} value={totalUsers} />
          </div>
        </div>
          <div style={{ width: '100%', height: '600px', background: '#1a1a1a', borderRadius: '8px', overflow: 'hidden' }}>
            <svg style={{ position: "absolute", width: 0, height: 0 }}>
              <defs>
                <filter id="red-glow" height="150%" width="150%" x="-25%" y="-25%" colorInterpolationFilters="sRGB">
                  <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ff4c4c" floodOpacity="0.7" />
                </filter>
              </defs>
            </svg>
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
                    geographies.map((geo: any) => {
                      // Check if this country is active
                      const isActive = activeCountries.has(geo.properties.name); 

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={isActive ? "#ff4c4c" : "#2d2d2d"}
                          stroke="#404040"
                          strokeWidth={0.5}
                          style={{
                            default: {
                              fill: isActive ? "#ff4c4c" : "#2d2d2d",
                              stroke: "#404040",
                              strokeWidth: 0.5,
                              outline: "none",
                              filter: isActive ? "url(#red-glow)" : "none",
                            },
                            hover: {
                              fill: isActive ? "#ff6666" : "#3d3d3d",
                              stroke: "#606060",
                              strokeWidth: 0.5,
                              outline: "none",
                              filter: isActive ? "url(#red-glow)" : "none",
                            },
                            pressed: {
                              fill: isActive ? "#cc3333" : "#4d4d4d",
                              stroke: "#707070",
                              strokeWidth: 0.5,
                              outline: "none",
                              filter: isActive ? "url(#red-glow)" : "none",
                            },
                          }}
                        />
                      );
                    })
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
          <div
          style={{
            marginTop: '20px',
            color: '#fff', // white text for better contrast
            textAlign: 'center',
            padding: '8px 20px',
            borderRadius: '24px',
            backgroundColor: 'rgba(255, 76, 76, 0.15)',  // same translucent red
            boxShadow: '0 0 15px rgba(255, 76, 76, 0.4)', // glowing red shadow
            fontWeight: '700',
            fontSize: '18px',
            userSelect: 'none',
            fontFamily: 'system-ui, sans-serif',
            maxWidth: '300px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <p style={{ margin: 0 }}>
            Total Countries With Users: {markers.length}
          </p>
        </div>
        </main>
      </div>
    </>
  );
}