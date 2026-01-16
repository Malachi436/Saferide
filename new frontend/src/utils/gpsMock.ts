/**
 * GPS Mock Engine
 * Simulates bus movement along a route for live tracking demonstration
 * TODO: Replace with actual GPS tracking from backend WebSocket/API
 */

import { Location } from "../types/models";

export interface GPSMockConfig {
  route: Location[];
  intervalMs?: number; // Default: 5000 (5 seconds)
  loop?: boolean; // Whether to loop back to start after reaching end
}

export class GPSMockEngine {
  private route: Location[];
  private currentIndex: number = 0;
  private intervalMs: number;
  private loop: boolean;
  private intervalId: NodeJS.Timeout | null = null;
  private listeners: Array<(location: Location, progress: number) => void> = [];

  constructor(config: GPSMockConfig) {
    this.route = config.route;
    this.intervalMs = config.intervalMs || 5000;
    this.loop = config.loop !== undefined ? config.loop : true;
  }

  /**
   * Start the GPS simulation
   */
  start() {
    if (this.intervalId) {
      return; // Already running
    }

    this.intervalId = setInterval(() => {
      this.tick();
    }, this.intervalMs);

    // Emit initial position
    this.emitCurrentLocation();
  }

  /**
   * Stop the GPS simulation
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Reset to start of route
   */
  reset() {
    this.currentIndex = 0;
    this.emitCurrentLocation();
  }

  /**
   * Subscribe to location updates
   */
  subscribe(listener: (location: Location, progress: number) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Get current location
   */
  getCurrentLocation(): Location {
    return this.route[this.currentIndex];
  }

  /**
   * Get progress percentage (0-100)
   */
  getProgress(): number {
    return (this.currentIndex / (this.route.length - 1)) * 100;
  }

  /**
   * Internal tick function
   */
  private tick() {
    this.currentIndex++;

    if (this.currentIndex >= this.route.length) {
      if (this.loop) {
        this.currentIndex = 0;
      } else {
        this.stop();
        this.currentIndex = this.route.length - 1;
      }
    }

    this.emitCurrentLocation();
  }

  /**
   * Emit current location to all listeners
   */
  private emitCurrentLocation() {
    const location = this.getCurrentLocation();
    const progress = this.getProgress();
    this.listeners.forEach((listener) => listener(location, progress));
  }
}

/**
 * Helper to create a mock GPS engine with a predefined route
 */
export function createMockGPSEngine(route: Location[]): GPSMockEngine {
  return new GPSMockEngine({
    route,
    intervalMs: 5000, // Update every 5 seconds
    loop: true,
  });
}
