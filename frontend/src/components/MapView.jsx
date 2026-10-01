import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapView({ geo }) {
  if (!geo) return null;
  const position = [geo.latitude, geo.longitude];
  return (
    <div className="bg-ink-800 border border-ink-600 rounded-lg p-6">
      <h3 className="font-display text-xl mb-4">On the map</h3>
      <div className="rounded-md overflow-hidden border border-ink-600" style={{ height: 260 }}>
        <MapContainer center={position} zoom={11} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={position} icon={markerIcon}>
            <Popup>{geo.name}, {geo.country}</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
