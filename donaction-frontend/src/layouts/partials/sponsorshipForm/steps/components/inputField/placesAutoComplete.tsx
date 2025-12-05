import React, { forwardRef, useEffect } from 'react';

const PlacesAutoComplete = forwardRef<
	HTMLInputElement,
	{
		id: string;
		onBlur: Function;
		className: string;
		onChange: Function;
		defaultValue?: string;
	}
>((props, ref) => {
	useEffect(() => {
		const input = document.getElementById(props.id) as HTMLInputElement;
		if (input) {
			const autocomplete = new google.maps.places.Autocomplete(input, {
				// types: ['street_address', 'stadium'],
				// types: ['point_of_interest', 'establishment'],
				types: [],
				componentRestrictions: {
					country: 'fr',
				},
			});
			autocomplete.addListener('place_changed', () => {
				const place = autocomplete.getPlace();
				changeHiddenValue(place?.place_id);
			});
			if (props.defaultValue) {
				const service = new google.maps.places.PlacesService(document.createElement('div'));
				service.getDetails({ placeId: props.defaultValue || '' }, (place, status) => {
					if (status === google.maps.places.PlacesServiceStatus.OK) {
						let res = place?.formatted_address || place?.name || '';
						if (
							place?.types?.includes('point_of_interest') ||
							place?.types?.includes('establishment')
						) {
							res = `${place?.name}${place?.name ? ', ' : ''}${place?.formatted_address}`;
						}
						input.value = res;
						changeHiddenValue(place?.place_id);
					}
				});
			}
		}
	}, []);

	const changeHiddenValue = (value?: string) => {
		if (ref && typeof ref === 'object' && ref.current) {
			if ('value' in ref.current) {
				ref.current.value = value || '';
			}
		}
		props.onChange();
	};

	return (
		<>
			<input ref={ref} type='hidden' placeholder='PLACE_ID_CONTAINER' />
			<input
				id={props.id}
				onChange={() => changeHiddenValue()}
				type='text'
				placeholder='Recherchez un lieu, un établissement...'
				className={props.className}
			/>
		</>
	);
});

export default PlacesAutoComplete;
