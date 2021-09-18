import { Subject } from 'rxjs';
import type { Observable } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import type { MarkerOf } from './marker.types';
import { MarkerType } from './marker.types';
import type { MarkerInfo } from './markers';
import type { BeaconInfo } from './beacons';
import type { NavDeviceInfo } from './navdev';

export const markerSubject = new Subject<string | null>();

type MarkersObservableOf<T extends MarkerInfo> = Observable<MarkerOf<T>[]>;
type MarkerClickedObservableOf<T extends MarkerInfo> = Observable<MarkerOf<T> | undefined>;

export const getMarkerClicked = <T extends MarkerInfo>(
	markers$: MarkersObservableOf<T>
): MarkerClickedObservableOf<T> => {
	return markerSubject.pipe(
		withLatestFrom(markers$),
		map(([markerId, markers]) => {
			return markers.find((marker) => marker.id === markerId);
		})
	);
};

export const getBeaconClicked = (
	markers$: MarkersObservableOf<MarkerInfo>
): MarkerClickedObservableOf<BeaconInfo> =>
	getMarkerClicked(markers$).pipe(
		filter(
			(marker): marker is MarkerOf<BeaconInfo> | undefined =>
				!marker || marker.type === MarkerType.BEACON
		)
	);

export const getNavDeviceClicked = (
	markers$: MarkersObservableOf<MarkerInfo>
): MarkerClickedObservableOf<NavDeviceInfo> =>
	getMarkerClicked(markers$).pipe(
		filter(
			(marker): marker is MarkerOf<NavDeviceInfo> | undefined =>
				!marker || marker.type === MarkerType.NAVDEV
		)
	);
