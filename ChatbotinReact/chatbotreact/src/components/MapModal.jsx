import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './MapModal.css';

const MapModal = ({ isOpen, onClose, userLocation, businesses, businessType }) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen || !mapContainer.current || !userLocation) return;

    // Initialize map
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json', // Free MapLibre style
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 13,
    });

    map.on('load', () => {
      setMapLoaded(true);

      // Add user location marker
      new maplibregl.Marker({ color: '#667eea' })
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .setPopup(
          new maplibregl.Popup().setHTML(
            '<strong>📍 Your Location</strong>'
          )
        )
        .addTo(map);

      // Add business markers
      if (businesses && businesses.length > 0) {
        businesses.forEach((business, index) => {
          const marker = new maplibregl.Marker({ color: '#f5576c' })
            .setLngLat([business.longitude, business.latitude])
            .setPopup(
              new maplibregl.Popup().setHTML(
                `<div class="business-popup">
                  <strong>${business.name || 'Business'}</strong>
                  ${business.address ? `<p>${business.address}</p>` : ''}
                  ${business.distance ? `<p>📏 ${business.distance.toFixed(2)} km away</p>` : ''}
                </div>`
              )
            )
            .addTo(map);
        });

        // Fit map to show all markers
        const bounds = new maplibregl.LngLatBounds();
        bounds.extend([userLocation.longitude, userLocation.latitude]);
        businesses.forEach((business) => {
          bounds.extend([business.longitude, business.latitude]);
        });
        map.fitBounds(bounds, { padding: 50 });
      }

      // Add radius circle
      map.addSource('radius', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [userLocation.longitude, userLocation.latitude],
          },
        },
      });

      map.addLayer({
        id: 'radius-circle',
        type: 'circle',
        source: 'radius',
        paint: {
          'circle-radius': {
            stops: [
              [0, 0],
              [20, 200],
            ],
            base: 2,
          },
          'circle-color': '#667eea',
          'circle-opacity': 0.1,
          'circle-stroke-color': '#667eea',
          'circle-stroke-width': 2,
          'circle-stroke-opacity': 0.3,
        },
      });
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
      setMapLoaded(false);
    };
  }, [isOpen, userLocation, businesses]);

  if (!isOpen) return null;

  return (
    <div className="map-modal-overlay" onClick={onClose}>
      <div className="map-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="map-modal-header">
          <div>
            <h3>📍 Location Analysis</h3>
            {businessType && <p>Showing: {businessType}</p>}
          </div>
          <button className="map-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="map-container" ref={mapContainer} />
        {businesses && businesses.length > 0 && (
          <div className="map-info">
            <p>
              Found <strong>{businesses.length}</strong> businesses nearby
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapModal;
