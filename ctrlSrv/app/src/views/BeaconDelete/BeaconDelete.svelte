<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from 'smelte/src/components/Button/Button.svelte';
	import Dialog from 'smelte/src/components/Dialog';
	import ProgressCircular from 'smelte/src/components/ProgressCircular';
	import { deleteBeaconFromStore } from '$src/views/BeaconCreate/beacon.hook';
	import { deleteBeacon } from '$src/streams/beacons';

	import type { BeaconDeleteEvent } from './beacon-detele.events';
	import type { MarkerOf } from '$src/streams/marker.types';
	import type { BeaconInfo } from '$src/streams/beacons';

	enum DELETE_STATUS {
		INITIAL,
		CONFIRMING,
		CONFIRMED,
		DECLAINED,
		FETCHING,
		ERROR,
		DONE
	}

	const dispatch = createEventDispatcher<BeaconDeleteEvent>();

	export let beacon: MarkerOf<BeaconInfo> | null;

	$: {
		// Svelte not support guard or typing inside their html. So, we are forced to use this trick
		if (!beacon) throw Error('Beacon provided to BeaconDelete component is not valid');
	}

	let status = DELETE_STATUS.INITIAL;
	$: isConfirmDialogOpen = status === DELETE_STATUS.CONFIRMING;
	$: isFetching = status === DELETE_STATUS.FETCHING;
	$: isFailed = status === DELETE_STATUS.ERROR;

	function setStatus(newStatus: DELETE_STATUS) {
		status = newStatus;
		runSideEffects(status);
	}

	function onStatusChange(newStatus: DELETE_STATUS) {
		return () => setStatus(newStatus);
	}

	function runSideEffects(status: DELETE_STATUS) {
		switch (status) {
			case DELETE_STATUS.CONFIRMED:
				saveDeletedBeacon();
				return;
			case DELETE_STATUS.DONE:
				removeBeacon();
				return;
			default:
				return;
		}
	}

	function removeBeacon() {
		if (!beacon) return;
		deleteBeaconFromStore(beacon.id);
		dispatch('deleted');
	}

	function saveDeletedBeacon() {
		if (!beacon) return;
		setStatus(DELETE_STATUS.FETCHING);
		deleteBeacon(beacon.data.id).subscribe((success) => {
			if (success) {
				setStatus(DELETE_STATUS.DONE);
			} else {
				setStatus(DELETE_STATUS.ERROR);
				// eslint-disable-next-line no-console
				console.error('Beacon deletion failed.');
			}
		});
	}
</script>

<Button color="error" on:click={onStatusChange(DELETE_STATUS.CONFIRMING)}>Delete Beacon</Button>

{#if isFetching}
	<ProgressCircular />
	<span role="alert" class="sr-only">Deleting the beacon...</span>
{/if}
{#if isFailed}
	<span role="alert" class="text-error-500">Error to delete the beacon. Try again!</span>
{/if}
<Dialog bind:value={isConfirmDialogOpen}>
	<div class="font-normal" slot="title">
		Are you sure you wish to delete this beacon?
		<br />
		This operation is <strong>irreversible</strong>.
		<br />
	</div>
	<div slot="actions">
		<Button color="primary" outlined on:click={onStatusChange(DELETE_STATUS.CONFIRMED)}>Yes</Button>
		<Button color="primary" on:click={onStatusChange(DELETE_STATUS.DECLAINED)}>No</Button>
	</div>
</Dialog>

<!-- markup (zero or more items) goes here -->
