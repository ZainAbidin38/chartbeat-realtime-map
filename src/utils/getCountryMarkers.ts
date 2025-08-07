import * as topojson from "topojson-client";
import { geoCentroid } from "d3-geo";

// TypeScript interfaces
interface CountryMarker {
  name: string;
  coordinates: [number, number];
  markerOffset: number;
  userCount?: number;
}

// Mock user data - replace this with actual user data
const mockUserData: Record<string, number> = {
  "United States": 1250,
  "United Kingdom": 890,
  "Germany": 670,
  "Canada": 540,
  "Australia": 430,
  "France": 380,
  "Japan": 290,
  "Brazil": 250,
  "India": 180,
  "Netherlands": 160,
  "Sweden": 120,
  "Switzerland": 95,
  "Singapore": 80,
  "South Korea": 75,
  "Mexico": 60,
};

export async function getCountryMarkers(
  url = "/countries.json", 
  markerOffset = 15
): Promise<CountryMarker[]> {
  try {
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch geography data: ${res.status} ${res.statusText}`);
    }
    
    const data: any = await res.json();
    
    if (!data.objects?.world) {
      throw new Error("Invalid geography data format");
    }
    
    const geojson: any = topojson.feature(data, data.objects.world);
    
    if (!geojson?.features) {
      throw new Error("Invalid geography data: expected FeatureCollection with features");
    }
    
    // Filter countries that have users and add user counts
    const markersWithUsers = geojson.features
      .map((feature: any) => {
        const countryName = feature.properties?.name;
        const userCount = mockUserData[countryName];
        
        // Only include countries with users
        if (!userCount || !countryName) return null;
        
        const coordinates = geoCentroid(feature as any);
        
        // Validate coordinates
        if (!coordinates || coordinates.some((coord: number) => !isFinite(coord))) {
          console.warn(`Invalid coordinates for ${countryName}`);
          return null;
        }
        
        return {
          name: countryName,
          coordinates: coordinates as [number, number],
          markerOffset,
          userCount,
        };
      })
      .filter((marker: any): marker is CountryMarker => marker !== null)
      .sort((a: CountryMarker, b: CountryMarker) => (b.userCount || 0) - (a.userCount || 0)); // Sort by user count descending
    
    console.log(`Loaded ${markersWithUsers.length} countries with users`);
    return markersWithUsers;
    
  } catch (error) {
    console.error("Error in getCountryMarkers:", error);
    throw error;
  }
}

// Alternative function to get ALL countries (for reference)
export async function getAllCountryMarkers(
  url = "/countries.json", 
  markerOffset = 15
): Promise<CountryMarker[]> {
  try {
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch geography data: ${res.status} ${res.statusText}`);
    }
    
    const data: any = await res.json();
    const geojson: any = topojson.feature(data, data.objects.world);
    
    if (!geojson?.features) {
      throw new Error("Invalid geography data: expected FeatureCollection with features");
    }
    
    return geojson.features.map((feature: any) => ({
      name: feature.properties?.name || 'Unknown',
      coordinates: geoCentroid(feature as any) as [number, number],
      markerOffset,
    }));
    
  } catch (error) {
    console.error("Error in getAllCountryMarkers:", error);
    throw error;
  }
}