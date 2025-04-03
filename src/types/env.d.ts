
// Environment variables interface for window.__ENV__
interface Window {
  __ENV__?: {
    GOOGLE_CLIENT_ID: string;
    [key: string]: string;
  };
}
