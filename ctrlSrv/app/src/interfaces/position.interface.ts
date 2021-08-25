import type { IEntity } from "./entity.interface";

export interface IIndoorPosition {
    x: number;
    y: number;
}

export interface IIndoorMapMarker extends IEntity, IIndoorPosition {
    icon?: string;
    type: number;
    onClick?: (marker: IIndoorMapMarker) => void;
}

export interface IIndoorMapMarkerEntity extends IIndoorMapMarker {
    updatePosition: (newPosition: IIndoorPosition) => void;
}