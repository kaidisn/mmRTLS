import type { Beacon } from '$src/interfaces/beacon.interface';
import type { MarkerOf } from '$src/streams/marker.types';

export interface BeaconDetailsEvent {
	delete: MarkerOf<Beacon>;
}
