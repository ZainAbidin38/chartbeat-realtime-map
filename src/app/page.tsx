'use client';

import React, { useEffect, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps';

const geoUrl =
  'https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json';

const API_KEY = 'f3ee14c2f3f7bebf9021783c5d25cab4';
const SITE = 'abc7.com';

const countryCentroids: Record<string, [number, number]> = {
  US: [-95.7129, 37.0902],
  CA: [-106.3468, 56.1304],
  AU: [133.7751, -25.2744],
  PH: [121.774, 12.8797],
};

function getCentroid(code: string): [number, number] | null {
  return countryCentroids[code] || null;
}

function aggregateGeoData(pages: any[]) {
  const geoMap: Record<string, number> = {};
  pages.forEach(({ stats }) => {
    if (!stats?.geo) return;
    for (const [country, count] of Object.entries(stats.geo)) {
      geoMap[country] = (geoMap[country] || 0) + (count as number);
    }
  });

  return Object.entries(geoMap).map(([countryCode, count]) => ({
    countryCode,
    count,
  }));
}

export default function Home() {
  const [data, setData] = useState<{ countryCode: string; count: number }[]>(
    []
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `https://dashapi.chartbeat.com/live/toppages/v3/?apikey=${API_KEY}&host=${SITE}`
        );
        const json = await res.json();
        if (json.pages) {
          const geoData = aggregateGeoData(json.pages);
          setData(geoData);
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-screen">
      <ComposableMap projection="geoEqualEarth">
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: { fill: '#EAEAEC', stroke: '#D6D6DA' },
                  hover: { fill: '#F53', stroke: '#D6D6DA' },
                  pressed: { fill: '#E42', stroke: '#D6D6DA' },
                }}
              />
            ))
          }
        </Geographies>
        {data.map(({ countryCode, count }) => {
          const coords = getCentroid(countryCode);
          if (!coords) return null;
          return (
            <Marker key={countryCode} coordinates={coords}>
              <circle
                r={Math.log(count + 1)}
                fill="#F53"
                fillOpacity={0.6}
              />
            </Marker>
          );
        })}
      </ComposableMap>
    </div>
  );
}
