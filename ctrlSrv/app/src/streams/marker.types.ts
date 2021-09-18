export enum MarkerType {
	BEACON = 'BEACON',
	NAVDEV = 'NAVDEV',
	DEFAULT = 'DEFAULT'
}

export interface Marker {
	id: string;
	type: MarkerType;
	icon?: string;
	x: number;
	y: number;
}

export type Position = Pick<Marker, 'x' | 'y'>;

export interface MarkerInfo {
	id: number;
}

export interface MarkerOf<T extends MarkerInfo> extends Marker {
	data: T;
}

export interface MarkerEvents {
	onClick?(id: Marker['id']): void;
	onDrag?(id: Marker['id'], postion: Pick<Marker, 'x' | 'y'>): void;
}
