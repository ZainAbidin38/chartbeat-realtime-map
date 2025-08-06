"use client";

import React, { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { geoCentroid } from "d3-geo";

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const API_KEY = "6d0776e3d8035b56610117583df5517b";
const SITE = "abc7.com";

export default function Home() {
  const [data, setData] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `https://dashapi.chartbeat.com/live/cbp2_dash/v1/?all_platforms=1&host=${SITE}&apikey=${API_KEY}`
        );
        const json = await res.json();
        console.log("API response:", json);

        if (json.data && Array.isArray(json.data.pages)) {
          const geoMap: Record<string, number> = {};

          json.data.pages.forEach((page: any, index: number) => {
            if (!page.stats) {
              console.log(`Page ${index} missing stats`);
              return;
            }
            if (!page.stats.geo) {
              console.log(`Page ${index} missing stats.geo`);
              return;
            }

            Object.entries(page.stats.geo).forEach(([country, count]) => {
              geoMap[country] = (geoMap[country] || 0) + (count as number);
            });
          });

          console.log("Aggregated geo data:", geoMap);
          setData(geoMap);
        } else {
          console.log("No pages found in response data");
          setData({});
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
          {({ geographies }) => (
            <>
              {geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: { fill: "#DDD", stroke: "#AAA" },
                    hover: { fill: "#F53", stroke: "#AAA" },
                    pressed: { fill: "#E42", stroke: "#AAA" },
                  }}
                />
              ))}
              {geographies.map((geo) => {
                const countryName = geo.properties.NAME;
                const count = data[countryName];
                if (!count) return null;

                const centroid = geoCentroid(geo);
                if (!centroid || centroid.some(isNaN)) return null;

                return (
                  <Marker key={geo.rsmKey} coordinates={centroid}>
                    <circle r={Math.log(count + 1) * 3} fill="#F53" fillOpacity={0.6} />
                  </Marker>
                );
              })}
            </>
          )}
        </Geographies>
      </ComposableMap>
    </div>
  );
}