import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Dynamically resolves the FastAPI Backend Base URL.
 * Supports:
 * - Explicit EXPO_PUBLIC_API_URL in environment
 * - Web Browser (http://localhost:8000)
 * - Physical mobile devices on LAN via Expo Metro packager host IP (e.g. http://192.168.x.x:8000)
 * - Android Emulator loopback (http://10.0.2.2:8000)
 * - iOS Simulator / Localhost fallback (http://localhost:8000)
 */
export const getApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:8000';
  }

  // Attempt to extract the Metro dev server host IP (e.g. 192.168.31.53:8082 -> 192.168.31.53)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri && typeof hostUri === 'string') {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:8000`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }

  return 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Returns WebSocket streaming gateway URL.
 */
export const getWebSocketUrl = (path: string = '/ws/voice-stream'): string => {
  const base = getApiBaseUrl();
  const wsBase = base.replace(/^http/, 'ws');
  return `${wsBase}${path.startsWith('/') ? path : `/${path}`}`;
};

/**
 * Health check helper to test backend connectivity.
 */
export const checkBackendHealth = async (): Promise<{ isConnected: boolean; message: string }> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${getApiBaseUrl()}/health`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return { isConnected: true, message: data.service || 'Backend online' };
    }
    return { isConnected: false, message: `HTTP ${res.status}` };
  } catch (error: any) {
    return { isConnected: false, message: error.message || 'Offline fallback mode' };
  }
};
