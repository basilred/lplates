import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, ProjectionFunction } from 'react-simple-maps';
import { geoMercator } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import type { Feature, FeatureCollection, GeometryObject } from 'geojson';
import { MAP_CONFIG } from '../../utils/mapUtils';
import './RegionMap.css';

interface RegionMapProps {
  country: string;
  mapName: string;
}

const RegionMap: React.FC<RegionMapProps> = ({ country, mapName }) => {
  const config = MAP_CONFIG[country];
  const [geoData, setGeoData] = useState<Topology | null>(null);
  const [projection, setProjection] = useState<ProjectionFunction | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0]);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleZoomIn = () => {
    if (zoom >= 5) return;
    setZoom(z => Math.min(z * 1.2, 5));
  };

  const handleZoomOut = () => {
    if (zoom <= 0.2) return;
    setZoom(z => Math.max(z / 1.2, 0.2));
  };

  const handleReset = () => {
    setZoom(1);
  };

  const highlightedRegion = mapName;

  useEffect(() => {
    if (!config) return;

    setLoading(true);
    setError(false);

    fetch(config.url)
      .then(res => {
        if (!res.ok) throw new Error('Map load failed');
        return res.json();
      })
      .then(data => {
        setGeoData(data);

        try {
          const objectName = Object.keys(data.objects)[0] as string;
          const geoObject = data.objects[objectName];
          const collection = feature(data, geoObject) as unknown as FeatureCollection<GeometryObject>;
          const features = collection.features;
          const targetFeature = features.find((f: Feature) =>
            f.properties?.name === highlightedRegion ||
            f.properties?.['hc-key'] === highlightedRegion ||
            f.properties?.['hc-a2'] === highlightedRegion ||
            f.properties?.['alt-name']?.includes(highlightedRegion)
          );

          const newProjection = geoMercator();

          if (targetFeature) {
            newProjection.fitExtent([[100, 50], [700, 350]], targetFeature);
          } else {
            newProjection.fitSize([800, 400], feature(data, geoObject) as unknown as FeatureCollection);
          }

          setProjection(() => newProjection);
          if (newProjection.invert) {
            const inverted = newProjection.invert([400, 200]);
            if (inverted) {
              setMapCenter(inverted);
            }
          }
        } catch (e) {
          setError(true);
        }

        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [country, config, highlightedRegion]);

  if (!config) return null;

  return (
    <div className={`RegionMap ${loading ? 'RegionMap_loading' : ''} ${error ? 'RegionMap_error' : ''}`}>
      {loading && <div className="RegionMap-Loader"></div>}
      {!loading && !error && geoData && projection && (
        <>
          <div className="RegionMap-Controls">
            <button
              className="RegionMap-ControlButton"
              onClick={handleZoomIn}
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              className="RegionMap-ControlButton"
              onClick={handleReset}
              aria-label="Reset zoom"
              title="Reset"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
            <button
              className="RegionMap-ControlButton"
              onClick={handleZoomOut}
              aria-label="Zoom out"
            >
              −
            </button>
          </div>
          <ComposableMap
            projection={projection}
            width={800}
            height={400}
            className="RegionMap-Canvas"
          >
            <ZoomableGroup
              zoom={zoom}
              center={mapCenter}
              maxZoom={5}
              minZoom={0.2}
            >
              <Geographies geography={geoData}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const isHighlighted =
                      geo.properties.name === highlightedRegion ||
                      geo.properties['hc-key'] === highlightedRegion ||
                      geo.properties['hc-a2'] === highlightedRegion ||
                      geo.properties['alt-name']?.includes(highlightedRegion);

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        className={`RegionMap-Geography ${isHighlighted ? 'RegionMap-Geography_highlighted' : ''}`}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </>
      )}
      {error && <div className="RegionMap-Fallback">🗺️</div>}
    </div>
  );
};

export default React.memo(RegionMap);
