<script lang="ts">
	import Dialog from '../../components/Dialog/Dialog.svelte';
	import { markerSubject } from '../../streams/markers-interactions';

	import type { MarkerOf } from '../../streams/marker.types';
	import type { NavDeviceInfo } from '$src/streams/navdev';

	export let navDevice: MarkerOf<NavDeviceInfo> | null = null;

	function onClose() {
		markerSubject.next(null);
	}
</script>

<Dialog isVisible={!!navDevice} fullHeight={true} on:close={onClose}>
	<h3>Nav device</h3>
	<p>
		Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec consectetur, nisl eget
		consectetur tempor, nisl nunc ultrices eros, eu porttitor nisl nunc eget nisl.
	</p>
</Dialog>
