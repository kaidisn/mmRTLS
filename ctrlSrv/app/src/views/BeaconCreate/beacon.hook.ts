import { menuActions } from '$src/components/Menu/menu.stream';
import { creatingBeacon, saveBeacon, savedBeacon$ } from '$src/streams/beacons';
import { markersSubject } from '$src/streams/markers';
import { onDestroy, onMount } from 'svelte';

import type { Subscription } from 'rxjs';
import type { BeaconInfo } from '$src/streams/beacons';
import type { MarkerOf } from '$src/streams/marker.types';
import { markerSubject } from '$src/streams/markers-interactions';

export const useSaveBeacon = (): (() => void) => {
	let subscription: Subscription;

	function updateMarkers(beacon: MarkerOf<BeaconInfo>) {
		const markers = markersSubject.getValue();
		const newMarkers = markers.filter(({ id }) => id !== beacon.id);

		markersSubject.next([...newMarkers, beacon]);
	}

	function cleanStreams() {
		markerSubject.next(null);
		creatingBeacon.next({});
		menuActions.next(null);
	}

	onMount(() => {
		subscription = savedBeacon$.subscribe((beacon) => {
			const isSaved = !!beacon.id;
			if (isSaved) {
				updateMarkers(beacon);
				cleanStreams();
			} else alert('Fail! Try again!');
		});
	});

	onDestroy(() => {
		subscription.unsubscribe();
	});

	return () => saveBeacon.next();
};

export const deleteBeaconFromStore: (beaconId: string) => void = (beaconId: string) => {
	markersSubject.next(markersSubject.value.filter((marker) => marker.id !== beaconId));
};
