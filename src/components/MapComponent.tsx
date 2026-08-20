import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Complaint } from '../types';

interface MapComponentProps {
  mode: 'select' | 'single' | 'multi';
  latitude?: number;
  longitude?: number;
  complaints?: Complaint[];
  selectedLocationName?: string;
  onLocationSelect?: (lat: number, lng: number, addressHint?: string) => void;
  onSelectComplaint?: (complaint: Complaint) => void;
  height?: string;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  mode,
  latitude = 12.9716,
  longitude = 77.5946,
  complaints = [],
  selectedLocationName,
  onLocationSelect,
  onSelectComplaint,
  height = '350px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Fix default Leaflet icon paths
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    // Initialize Map
    const initialLat = latitude || 12.9716;
    const initialLng = longitude || 77.5946;
    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: mode === 'multi' ? 12 : 14,
      scrollWheelZoom: true
    });

    mapInstanceRef.current = map;

    // OpenStreetMap Tile Layer with dark bento filter styling
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" style="color: #64748b;">OpenStreetMap</a> contributors',
      maxZoom: 19,
      className: 'brightness-90 contrast-110 saturate-50'
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);

    // Mode: Location Selection for citizen submission
    if (mode === 'select') {
      const pin = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
      markerRef.current = pin;

      pin.on('dragend', () => {
        const pos = pin.getLatLng();
        if (onLocationSelect) {
          onLocationSelect(pos.lat, pos.lng);
        }
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        pin.setLatLng(e.latlng);
        if (onLocationSelect) {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        }
      });
    }

    // Mode: Single Location View for complaint details
    if (mode === 'single') {
      const pin = L.marker([initialLat, initialLng]).addTo(map);
      pin.bindPopup(`
        <div style="padding: 4px; font-family: sans-serif;">
          <div style="font-weight: 700; color: #f8fafc; font-size: 13px; margin-bottom: 2px;">${selectedLocationName || 'Complaint Site'}</div>
          <div style="color: #94a3b8; font-size: 11px; font-family: monospace;">Lat: ${initialLat.toFixed(4)}, Lng: ${initialLng.toFixed(4)}</div>
        </div>
      `).openPopup();
      L.circle([initialLat, initialLng], {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.2,
        radius: 300
      }).addTo(map);
    }

    // Trigger map invalidation on resize
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update multi-markers dynamically
  useEffect(() => {
    if (mode !== 'multi' || !mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    const bounds: L.LatLngExpression[] = [];

    complaints.forEach(c => {
      if (!c.latitude || !c.longitude) return;

      const priorityColor =
        c.priority === 'CRITICAL' ? '#f43f5e' : c.priority === 'HIGH' ? '#f59e0b' : c.priority === 'MEDIUM' ? '#eab308' : '#10b981';

      const customMarkerHtml = `
        <div style="
          background-color: ${priorityColor};
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 2px solid #0f172a;
          box-shadow: 0 0 12px ${priorityColor}88;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #020617;
          font-weight: 800;
          font-size: 11px;
          font-family: monospace;
        ">
          ${c.priority[0]}
        </div>
      `;

      const customIcon = L.divIcon({
        html: customMarkerHtml,
        className: 'custom-leaflet-marker',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([c.latitude, c.longitude], { icon: customIcon });

      const popupHtml = `
        <div style="min-width: 190px; font-family: sans-serif; padding: 4px;">
          <div style="font-size: 10px; font-weight: 800; font-family: monospace; color: ${priorityColor}; letter-spacing: 0.05em; margin-bottom: 2px;">
            ${c.priority} PRIORITY &bull; #${c.id}
          </div>
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px; color: #f8fafc;">
            ${c.title}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">
            Dept: <strong style="color: #cbd5e1;">${c.departmentName || 'General'}</strong> | Status: <strong style="color: #cbd5e1;">${c.status}</strong>
          </div>
          <button id="btn-${c.id}" style="
            background: #059669;
            color: #ffffff;
            border: 1px solid #10b981;
            border-radius: 8px;
            padding: 6px 10px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            width: 100%;
            transition: all 0.2s;
          ">
            Inspect Ticket &rarr;
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-${c.id}`);
        if (btn && onSelectComplaint) {
          btn.onclick = () => onSelectComplaint(c);
        }
      });

      markersLayerRef.current?.addLayer(marker);
      bounds.push([c.latitude, c.longitude]);
    });

    if (bounds.length > 0 && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(L.latLngBounds(bounds), { padding: [30, 30] });
    }
  }, [complaints, mode]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#0f172a] shadow-lg shadow-black/40">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-10" />
      {mode === 'select' && (
        <div className="absolute top-3 left-12 z-20 bg-[#0f172a]/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Drag pin or click map to set grievance coordinates
        </div>
      )}
    </div>
  );
};
