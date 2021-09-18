<script lang="ts" context="module">
	import type { LoadInput, LoadOutput } from '@sveltejs/kit';
	import { mapBackgroundImage, mapMaxPosition } from '../store/map-background-image.store';

	const UPLOAD_MAP_ROUTE = '/upload-map';

	export const load: (
		input: LoadInput
	) => Promise<
		LoadOutput<{
			mapSize: IIndoorPosition;
			backgroundImage: string;
		}>
	> = async () => {
		const config = mapMaxPosition.value;
		const backgroundImage = mapBackgroundImage.value;
		const configIsLoaded = !!config;
		return new Promise((resolve) => {
			resolve(
				configIsLoaded && !!backgroundImage
					? {
							status: 200,
							props: {
								mapSize: config as IIndoorPosition,
								backgroundImage
							}
					  }
					: {
							status: 303,
							redirect: UPLOAD_MAP_ROUTE
					  }
			);
		});
	};
</script>

<script lang="ts">
	import Marker from '../components/Map/Marker.svelte';
	import Map from '../components/Map/Map.svelte';
	import { Menu } from '$src/components/Menu/Menu';
	import { MenuActions } from '$src/components/Menu/Menu';
	import BeaconDetails from '../views/BreaconDetails/BeaconDetails.svelte';
	import NavDeviceDetails from '../views/NavDeviceDetails/NavDeviceDetails.svelte';
	import BeaconCreate from '../views/BeaconCreate/BeaconCreate.svelte';
	import { onMount$ } from '../utils/lifecycles';
	import { getMarkers } from '../streams/markers';
	import type { IIndoorPosition } from '$src/interfaces/position.interface';
	import {
		getBeaconClicked,
		getNavDeviceClicked,
		markerSubject
	} from '$src/streams/markers-interactions';
	import { createMenuActionsStream, menuActions } from '$src/components/Menu/menu.stream';
	import { MarkerType } from '$src/streams/marker.types';
	import type { Marker as IMarker, MarkerOf } from '$src/streams/marker.types';
	import type { BeaconInfo } from '$src/streams/beacons';
	import { creatingBeacon } from '$src/streams/beacons';

	export let mapSize: IIndoorPosition;
	export let backgroundImage: string;

	const markers$ = onMount$.pipe(getMarkers);

	const beaconsMarkerClicked$ = getBeaconClicked(markers$);
	const navDeviceMarkerClicked$ = getNavDeviceClicked(markers$);

	const onMarkerClick = (e: CustomEvent<{ id: IMarker['id'] }>) => {
		const { id } = e.detail;
		markerSubject.next(id);
	};

	const isCreateBeaconEnabled$ = createMenuActionsStream([MenuActions.CREATE, MenuActions.EDIT]);
	const onChange = (e: CustomEvent<MenuActions>) => {
		menuActions.next(e.detail);
	};

	function onBeaconEdit(e: CustomEvent<MarkerOf<BeaconInfo>>) {
		menuActions.next(MenuActions.EDIT);
		const marker = e.detail;

		const {
			x,
			y,
			data: { id, ...markerData }
		} = marker;

		creatingBeacon.next({
			beaconId: id,
			x,
			y,
			...markerData
		});
	}
</script>

<div class="container">
	<Map {backgroundImage} {mapSize} editMode={false}>
		<Menu on:choose={onChange} />
		{#if $isCreateBeaconEnabled$} <BeaconCreate /> {/if}
		{#each $markers$ as { x, y, id, icon, data, type } (id)}
			<Marker
				{x}
				{y}
				{id}
				{icon}
				on:click={onMarkerClick}
				disabled={$creatingBeacon?.beaconId === data.id && type === MarkerType.BEACON}
			/>
		{/each}
	</Map>
	<BeaconDetails beacon={$beaconsMarkerClicked$} on:edit={onBeaconEdit} />
	<NavDeviceDetails navDevice={$navDeviceMarkerClicked$} />
</div>
