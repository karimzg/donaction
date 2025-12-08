'use client';
import React, { useEffect, useId, useRef } from 'react';
import './index.scss';

interface IGMaps {
	center: {
		lat: number;
		lng: number;
	};
}
const GMaps: React.FC<IGMaps> = (props) => {
	// TODO: ID to be unique and fix server error
	const id = 'uniqueID';
	const mapRef = useRef<google.maps.Map>();

	const setupMap = () => {
		const { lat, lng } = props.center;
		mapRef.current = new google.maps.Map(
			document.getElementById(`googleMap_${id}`) as HTMLElement,
			{
				center: new google.maps.LatLng(lat, lng),
				zoomControl: false,
				disableDoubleClickZoom: true,
				fullscreenControl: false,
				streetViewControl: false,
				mapTypeControl: false,
				clickableIcons: false,
				zoom: 15,
				mapId: `googleMap_${id}`,
			},
		);
		const marker = new google.maps.marker.AdvancedMarkerElement({
			position: new google.maps.LatLng(lat, lng),
			map: mapRef.current,
			title: 'test',
		});
		marker.addListener('click', () => {
			document.getElementById(`googleMap_${id}_marker`)?.click();
		});
		const infowindow = new google.maps.InfoWindow({
			content: `<a id="googleMap_${id}_marker" href="https://www.google.com/maps?q=${lat},${lng}" target="_blank"><b>Cliquez ici pour voir les directions</b></a>`,
		});
		infowindow.open({
			anchor: marker,
			map: mapRef.current,
		});
	};

	useEffect(() => {
		const callback = (entries: IntersectionObserverEntry[]) => {
			if (entries[0].isIntersecting && !mapRef.current) {
				setupMap();
			}
		};

		const observer = new IntersectionObserver(callback, {
			root: null,
			rootMargin: '0px',
			threshold: 0.1,
		});
		const target = document.querySelector(`#googleMap_${id}`);

		if (target) {
			observer.observe(target as Element);
			// TODO: https://medium.com/@devlucky/about-passive-event-listeners-224ff620e68c
		}
	}, []);

	return <div id={`googleMap_${id}`} className='gMapCard'></div>;
};

export default GMaps;
