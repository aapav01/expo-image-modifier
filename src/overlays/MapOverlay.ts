import { Position } from "../types";

export interface MapOverlayOptions {
  center?: Position;
  zoom?: number;
  width?: number;
  height?: number;
  style?: string;
  showControls?: boolean;
  initialMarkers?: Array<{
    position: Position;
    color?: string;
    size?: number;
    label?: string;
    id?: string;
  }>;
}

export class MapOverlay {
  private markers: Array<{
    position: Position;
    color?: string;
    size?: number;
    label?: string;
    id: string;
  }> = [];

  public center: Position;
  public zoom: number;
  public width: number;
  public height: number;
  public style: string;
  public showControls: boolean;

  constructor(options: MapOverlayOptions = {}) {
    this.center = options.center || { x: 0, y: 0 };
    this.zoom = options.zoom || 1;
    this.width = options.width || 300;
    this.height = options.height || 200;
    this.style = options.style || 'standard';
    this.showControls = options.showControls ?? true;

    // Initialize with any markers provided in options
    if (options.initialMarkers && options.initialMarkers.length > 0) {
      options.initialMarkers.forEach(marker => this.addMarker(marker));
    }
  }

  /**
   * Add a marker to the map overlay
   */
  addMarker(marker: {
    position: Position;
    color?: string;
    size?: number;
    label?: string;
    id?: string;
  }): void {
    this.markers.push({
      id:
        marker.id ||
        `marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: marker.position,
      color: marker.color,
      size: marker.size,
      label: marker.label,
    });
  }

  /**
   * Get all markers
   */
  getMarkers(): Array<{
    position: Position;
    color?: string;
    size?: number;
    label?: string;
    id: string;
  }> {
    return this.markers;
  }

  /**
   * Clear all markers
   */
  clearMarkers(): void {
    this.markers = [];
  }
}
