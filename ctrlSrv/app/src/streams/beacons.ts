import type { Observable } from 'rxjs';
import { Subject, BehaviorSubject, of } from 'rxjs';
import { catchError, map, filter, switchMap, withLatestFrom } from 'rxjs/operators';
import { fromFetch } from 'rxjs/fetch';
import type { Beacon } from '$src/interfaces/beacon.interface';
import { MarkerType } from './marker.types';
import type { MarkerInfo } from './marker.types';
import type { MarkerOf } from './marker.types';
import { menuActions } from '$src/components/Menu/menu.stream';
import MenuActions from '$src/components/Menu/MenuActions';

const DEFAULT_HEADERS = {
	Accept: 'application/json',
	'Content-Type': 'application/json'
};

const DELETE_BEACON_URL = 'http://localhost:3000/beacons/';

/**
 * GET BEACONS
 */

export const BEACON_ICON_URL = './static/markers/antenna.png';

export type BeaconInfo = MarkerInfo & Omit<Beacon, 'beaconId' | 'x' | 'y'>;

export const beacons$: Observable<MarkerOf<BeaconInfo>[]> = fromFetch(
	'http://localhost:3000/beacons',
	{
		selector: (response) => response.json() as Promise<Beacon[]>
	}
).pipe(
	catchError((err) => {
		// eslint-disable-next-line no-console
		console.error(err);
		return of([] as Beacon[]);
	}),
	map((beacons) => beacons.map(fromBeaconToMarker))
);

/**
 * SAVE BEACONS
 */

export const creatingBeacon = new BehaviorSubject<Partial<Beacon>>({});
export const saveBeacon = new Subject<void>();

const beaconIsReadyToSave$ = creatingBeacon.pipe(filter(isValidBeaconByAction));

export const savedBeacon$ = saveBeacon.pipe(
	withLatestFrom(menuActions),
	map(([, action]) => action),
	filter((action): action is MenuActions => !!action),
	withLatestFrom(beaconIsReadyToSave$),
	switchMap(([action, beacon]) => chooseEndopint(action)(beacon))
);

export function createBeacon(beacon: Omit<Beacon, 'beaconId'>): Observable<MarkerOf<BeaconInfo>> {
	const requestConfig = {
		headers: DEFAULT_HEADERS,
		method: 'POST',
		body: JSON.stringify(beacon)
	};

	return fromFetch(new Request('http://localhost:3000/beacons', requestConfig), {
		selector: (response) => response.json() as Promise<Beacon>
	}).pipe(
		catchError((err) => {
			// eslint-disable-next-line no-console
			console.error(err);
			return of({} as Beacon);
		}),
		map(fromBeaconToMarker)
	);
}

export function updateBeacon(beacon: Beacon): Observable<MarkerOf<BeaconInfo>> {
	const requestConfig = {
		headers: DEFAULT_HEADERS,
		method: 'PUT',
		body: JSON.stringify(beacon)
	};

	return fromFetch(
		new Request(`http://localhost:3000/beacons/${beacon.beaconId}`, requestConfig)
	).pipe(
		map((response) => {
			if (response.ok) return beacon;
			throw new Error('Error while updating beacon');
		}),
		catchError((err) => {
			// eslint-disable-next-line no-console
			console.error(err);
			return of({} as Beacon);
		}),
		map(fromBeaconToMarker)
	);
}

/**
 * Beacon Utils
 */

type BeaconStreamAction = (beacon: Beacon) => Observable<MarkerOf<BeaconInfo>>;

function chooseEndopint(activeAction: MenuActions): BeaconStreamAction {
	switch (activeAction) {
		case MenuActions.CREATE:
			return createBeacon;
		case MenuActions.EDIT:
			return updateBeacon;
	}
}

function isValidBeaconByAction(beacon: Partial<Beacon>): beacon is Beacon {
	const activeAction = menuActions.getValue();
	if (activeAction === MenuActions.CREATE) return isValidBeacon(beacon);
	if (activeAction === MenuActions.EDIT) return isValidBeacon(beacon) && !!beacon.beaconId;
	return false;
}

function isValidBeacon(beacon: Partial<Beacon>): beacon is Beacon {
	return !!(beacon.mac && beacon.name && beacon.tssi && beacon.channel && beacon.x && beacon.y);
}

function fromBeaconToMarker({ beaconId, x, y, ...beacon }: Beacon): MarkerOf<BeaconInfo> {
	return {
		id: `beacon-${beaconId}`,
		type: MarkerType.BEACON,
		icon: './static/markers/antenna.png',
		x,
		y,
		data: {
			...beacon,
			id: beaconId
		}
	};
}

export const deleteBeacon: (beaconId: number) => Observable<boolean> = (beaconId) => {
	const requestConfig: RequestInit = {
		headers: DEFAULT_HEADERS,
		method: 'DELETE'
	};

	return fromFetch(new Request(DELETE_BEACON_URL + beaconId, requestConfig), {
		selector: (response) => of(response.ok)
	}).pipe(catchError(() => of(false))) as Observable<boolean>;
};
