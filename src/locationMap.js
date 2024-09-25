import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import html2canvas from 'html2canvas';

const LocationMap = () => {
  const [location, setLocation] = useState('');
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]); // Default location
  const [zoom, setZoom] = useState(13);
  const [capturedImage, setCapturedImage] = useState(null);
  const [mapType, setMapType] = useState('satellite');
  const mapRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${location}`
      );
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
        setZoom(15);
      } else {
        alert('Location not found.');
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  const captureMap = async () => {
    if (mapRef.current) {
      const mapElement = mapRef.current._container;

      setTimeout(async () => {
        const canvas = await html2canvas(mapElement, {
          useCORS: true,
          logging: true,
          allowTaint: false,
          scale: 2,
        });
        const imageDataUrl = canvas.toDataURL('image/png');
        setCapturedImage(imageDataUrl);
      }, 1000);
    }
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (capturedImage) {
      try {
        const response = await fetch('/api/submit-map', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: capturedImage, location }),
        });

        if (response.ok) {
          alert('Map submitted successfully!');
          setCapturedImage(null);
        } else {
          throw new Error('Failed to submit map');
        }
      } catch (error) {
        console.error('Error submitting map:', error);
      }
    }
  };

  function MapUpdater() {
    const map = useMap();
    map.setView(mapCenter, zoom);
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 flex flex-col justify-center items-center p-5">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-5xl p-8">
        <h2 className="text-2xl font-semibold text-center mb-4">Location Map Capture</h2>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location or pincode"
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
          </div>
        </form>

        {/* Toggle between satellite and terrain views */}
        <div className="flex justify-around mb-4">
          <button
            onClick={() => setMapType('satellite')}
            className={`px-4 py-2 rounded-full font-medium shadow-sm transition-all ${
              mapType === 'satellite' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            Satellite View
          </button>
          <button
            onClick={() => setMapType('terrain')}
            className={`px-4 py-2 rounded-full font-medium shadow-sm transition-all ${
              mapType === 'terrain' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            Terrain View
          </button>
        </div>

        {/* Flex container for map and captured image */}
        <div className="flex">
          <div className="h-64 w-1/2 rounded-md overflow-hidden mb-4 shadow-md relative">
            <MapContainer center={mapCenter} zoom={zoom} style={{ height: '100%', width: '100%' }} ref={mapRef}>
              <TileLayer
                url={
                  mapType === 'satellite'
                    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                    : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
                }
                attribution='Tiles © Esri — Source: Esri, DeLorme, NAVTEQ'
              />
              <MapUpdater />
            </MapContainer>
          </div>

          {/* Captured Image Section */}
          <div className="flex flex-col items-center justify-center w-1/2 ml-4">
            {capturedImage && (
              <div className="w-full flex flex-col items-center">
                <img src={capturedImage} alt="Captured Map" className="h-64 w-full rounded-md shadow-md mb-4 object-cover" />
                <button
                  onClick={handleImageSubmit}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                >
                  Submit Map
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Capture Map Button Below the Image */}
        <button
          onClick={captureMap}
          className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all mb-4"
        >
          Capture Map
        </button>
      </div>
    </div>
  );
};

export default LocationMap;
