<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from 'smelte/src/components/Button/Button.svelte';
	import Dialog from '../../components/Dialog/Dialog.svelte';

	import { markerSubject } from '../../streams/markers-interactions';
	import type { MarkerOf } from '../../streams/marker.types';
	import type { BeaconInfo } from '$src/streams/beacons';
	import BeaconDelete from '../BeaconDelete/BeaconDelete.svelte';
	import MenuActions from '$src/components/Menu/MenuActions';
	import { createMenuActionsStream } from '$src/components/Menu/menu.stream';

	type Events = {
		edit: MarkerOf<BeaconInfo>;
	};

	const dispatch = createEventDispatcher<Events>();
	const isEditBeaconEnabled$ = createMenuActionsStream(MenuActions.EDIT);

	export let beacon: MarkerOf<BeaconInfo> | null = null;

	function onClose(): void {
		markerSubject.next(null);
	}

	function onEdit(): void {
		if (beacon) dispatch('edit', beacon);
	}
</script>

<Dialog
	isVisible={!$isEditBeaconEnabled$ && !!(beacon && beacon.data)}
	fullHeight={true}
	on:close={onClose}
>
	<h3>{beacon?.data.name}</h3>
	<section class="flex items-center gap-4 py-8">
		<img class="h-16 w-16" src={beacon?.icon} alt="beacon icon" />
		<ul class="leading-loose flex-1">
			<li>
				<strong><abbr title="Media Access Control">MAC</abbr> address:</strong>
				<span>{beacon?.data.mac}</span>
			</li>
			<li>
				<strong>Channel:</strong>
				<span>{beacon?.data.channel}</span>
			</li>
			<li>
				<strong><abbr title="TSSI">TSSI</abbr>:</strong>
				<span>{beacon?.data.tssi}</span>
			</li>
			<li>
				<strong>Position:</strong>
				<span>x: {beacon?.x}, y: {beacon?.y}</span>
			</li>
		</ul>
	</section>
	<BeaconDelete {beacon} on:deleted={onClose} />
	<Button on:click={onEdit}>Edit</Button>
</Dialog>
