import { LoadScript, GoogleMap } from "@react-google-maps/api";

export default function Map() {
  return (
    <LoadScript
    googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
    libraries={['places']}
  >
    {/* GoogleMap component */}
  </LoadScript>
  );
}
