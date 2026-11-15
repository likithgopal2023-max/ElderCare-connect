import React, { useState } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Phone, Clock, ExternalLink, Compass } from 'lucide-react';
import { AppointmentItem } from '../types';

interface AppointmentMapViewProps {
  appointments: AppointmentItem[];
  selectedAppointmentId?: string;
  onSelectAppointment: (id: string) => void;
}

const ClinicMarker: React.FC<{
  apt: AppointmentItem;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ apt, isSelected, onSelect }) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={apt.coordinates}
        title={`${apt.doctorName} — ${apt.clinic}`}
        onClick={onSelect}
      >
        <Pin
          background={isSelected ? '#0f766e' : '#0284c7'}
          borderColor={'#ffffff'}
          glyphColor={'#ffffff'}
          scale={isSelected ? 1.25 : 1.05}
        />
      </AdvancedMarker>
      {isSelected && marker && (
        <InfoWindow anchor={marker} maxWidth={260} onCloseClick={() => {}}>
          <div className="p-1 text-slate-900 space-y-1">
            <div className="font-bold text-sm">{apt.doctorName}</div>
            <div className="text-xs font-medium text-teal-700">
              {apt.specialty} · {apt.clinic}
            </div>
            <div className="text-xs text-slate-600">{apt.address}</div>
            <div className="text-xs font-mono font-semibold text-slate-800 pt-1">
              {apt.dateLabel} • {apt.time} ({apt.distanceKm} km away)
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export const AppointmentMapView: React.FC<AppointmentMapViewProps> = ({
  appointments,
  selectedAppointmentId,
  onSelectAppointment,
}) => {
  const [showDirectionsPanel, setShowDirectionsPanel] = useState(false);

  const activeApt =
    appointments.find((a) => a.id === selectedAppointmentId) || appointments[0];

  const rawApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const hasValidApiKey = Boolean(
    rawApiKey && rawApiKey.trim() !== '' && rawApiKey !== 'MY_GOOGLE_MAPS_API_KEY'
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Clinic Location & Route Assistance
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Approximate distance calculated from Indiranagar residence without exposing live GPS
            coordinates unnecessarily.
          </p>
        </div>
        {activeApt && (
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowDirectionsPanel((prev) => !prev)}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{showDirectionsPanel ? 'Hide Route Steps' : 'Get Directions'}</span>
            </button>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                `${activeApt.clinic}, ${activeApt.address}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Clinic Cards List */}
        <div className="lg:col-span-5 p-4 space-y-3 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 max-h-[420px] overflow-y-auto">
          {appointments.map((apt) => {
            const isSelected = activeApt?.id === apt.id;
            return (
              <button
                key={apt.id}
                onClick={() => onSelectAppointment(apt.id)}
                className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-600 dark:border-teal-500'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {apt.doctorName}
                    </div>
                    <div className="text-xs font-medium text-teal-700 dark:text-teal-400">
                      {apt.clinic} · {apt.specialty}
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 tabular-nums shrink-0">
                    {apt.distanceKm} km away
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-2">{apt.address}</div>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2.5 pt-2 border-t border-slate-200/70 dark:border-slate-700/60 tabular-nums">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {apt.dateLabel} • {apt.time}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {apt.contactNumber}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Interactive Google Map Container with Explicit Height (CF2) */}
        <div className="lg:col-span-7 relative h-[420px] w-full bg-slate-100 dark:bg-slate-950">
          {hasValidApiKey && activeApt ? (
            <APIProvider apiKey={rawApiKey!} libraries={['marker']}>
              <div style={{ height: '420px', width: '100%' }}>
                <GoogleMap
                  mapId="DEMO_MAP_ID"
                  defaultZoom={13}
                  center={activeApt.coordinates}
                  gestureHandling="cooperative"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                >
                  {appointments.map((apt) => (
                    <ClinicMarker
                      key={apt.id}
                      apt={apt}
                      isSelected={activeApt.id === apt.id}
                      onSelect={() => onSelectAppointment(apt.id)}
                    />
                  ))}
                </GoogleMap>
              </div>
            </APIProvider>
          ) : (
            <div className="h-full w-full flex flex-col justify-between p-6 bg-gradient-to-br from-slate-100 via-teal-50/40 to-sky-50 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 dark:text-teal-300">
                  <Compass className="w-4 h-4" />
                  <span> Bengaluru Healthcare Corridor Map View</span>
                </div>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {activeApt?.coordinates.lat.toFixed(4)}° N, {activeApt?.coordinates.lng.toFixed(4)}° E
                </span>
              </div>

              {activeApt && (
                <div className="my-auto max-w-md mx-auto w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-bold text-slate-900 dark:text-white">
                        {activeApt.clinic}
                      </div>
                      <div className="text-xs font-medium text-teal-700 dark:text-teal-400">
                        {activeApt.doctorName} · {activeApt.specialty}
                      </div>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-mono font-semibold tabular-nums">
                      📍 {activeApt.distanceKm} km away
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{activeApt.address}</p>
                  <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between tabular-nums">
                    <span>
                      Visit: {activeApt.dateLabel} at {activeApt.time}
                    </span>
                    <span>Est. 18 mins by car</span>
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Select any appointment on the left to inspect clinic address, distance, and route
                guidance.
              </div>
            </div>
          )}

          {/* Optional Step-by-Step Route Drawer */}
          {showDirectionsPanel && activeApt && (
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-lg space-y-2 z-10">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-teal-700" />
                  <span>
                    Route to {activeApt.clinic} ({activeApt.distanceKm} km · ~18 mins)
                  </span>
                </div>
                <button
                  onClick={() => setShowDirectionsPanel(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
              <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-decimal list-inside">
                <li>Depart from 12th Main Indiranagar toward Intermediate Ring Road (1.2 km).</li>
                <li>Continue toward {activeApt.address} with Caretaker Meena Nair assisting.</li>
                <li>Senior drop-off bay is located directly at the main Cardiology entrance.</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
