"use client";

import React, { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const API_KEY = "6d0776e3d8035b56610117583df5517b";
const SITE = "abc7.com";

// Country name → [lng, lat]
const countryCentroids: Record<string, [number, number]> = {
  "United States": [-95.7129, 37.0902],
  "United Kingdom": [-3.435973, 55.378051],
  India: [78.9629, 20.5937],
  Canada: [-106.3468, 56.1304],
  Australia: [133.7751, -25.2744],
  Philippines: [121.774, 12.8797],
  // Add more as needed...
};

export default function Home() {
  const [data, setData] = useState<{ countryName: string; count: number }[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `https://dashapi.chartbeat.com/live/cbp2_dash/v1/?all_platforms=1&host=${SITE}&apikey=${API_KEY}`
        );
        const json = await res.json();
        if (json.countries) {
          const geoData = Object.entries(json.countries).map(
            ([countryName, count]) => ({
              countryName,
              count: count as number,
            })
          );
          setData(geoData);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ComposableMap projection="geoEqualEarth" projectionConfig={{ scale: 150 }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: { fill: "#DDD", stroke: "#AAA" },
                  hover: { fill: "#F53", stroke: "#AAA" },
                  pressed: { fill: "#E42", stroke: "#AAA" },
                }}
              />
            ))
          }
        </Geographies>
        {data.map(({ countryName, count }) => {
          const coords = countryCentroids[countryName];
          if (!coords) return null;
          return (
            <Marker key={countryName} coordinates={coords}>
              <circle r={Math.log(count + 1) * 3} fill="#F53" fillOpacity={0.6} />
            </Marker>
          );
        })}
      </ComposableMap>
    </div>
  );
}
