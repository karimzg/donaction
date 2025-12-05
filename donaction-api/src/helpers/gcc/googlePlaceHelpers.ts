interface AddressComponent {
    types: string[];
    long_name: string;
    short_name: string;
}

interface Location {
    lat: number;
    lng: number;
}

interface Viewport {
    east: number;
    west: number;
    north: number;
    south: number;
}

interface Geometry {
    location: Location;
    viewport: Viewport;
}

interface PlusCode {
    global_code: string;
    compound_code: string;
}

interface GoogleMapsPlace {
    url: string;
    icon: string;
    name: string;
    types: string[];
    geometry: Geometry;
    place_id: string;
    vicinity: string;
    plus_code: PlusCode;
    reference: string;
    utc_offset: number;
    adr_address: string;
    formatted_address: string;
    html_attributions: string[];
    address_components: AddressComponent[];
    icon_mask_base_uri: string;
    utc_offset_minutes: number;
    icon_background_color: string;
    formatted_phone_number?: string;
    website?: string;
}


const getAddrComponent = (place: GoogleMapsPlace, componentTemplate: any /* TODO: type*/) => {
    if (!place.address_components) {
        return '';
    }
    let result: any; /** TODO: type*/
    for (const component of place.address_components) {
        const addressType = component.types[0];
        if (componentTemplate[addressType]) {
            result = component[componentTemplate[addressType]];
            return result;
        }
    }
    return '';
}

const getStreetNumber = (place: GoogleMapsPlace) => {
    if (!place) {
        return '';
    }
    const COMPONENT_TEMPLATE = {street_number: 'short_name'};
    return getAddrComponent(place, COMPONENT_TEMPLATE);
}

const getStreet = (place: GoogleMapsPlace) => {
    if (!place) {
        return '';
    }
    const COMPONENT_TEMPLATE = {route: 'long_name'};
    return getAddrComponent(place, COMPONENT_TEMPLATE);
}

const getAddress = (place: GoogleMapsPlace) => {
    if (!place) {
        return '';
    }
    const streetNumber = getStreetNumber(place);
    const street = getStreet(place);
    return street || streetNumber ? `${getStreetNumber(place)} ${getStreet(place)}` : '';
}

const getCity = (place: GoogleMapsPlace) => {
    if (!place) {
        return '';
    }
    const COMPONENT_TEMPLATE = {locality: 'long_name'};
    return getAddrComponent(place, COMPONENT_TEMPLATE);
}

const getState = (place: GoogleMapsPlace) => {
    if (!place) {
        return '';
    }
    const COMPONENT_TEMPLATE = {administrative_area_level_1: 'short_name'};
    return getAddrComponent(place, COMPONENT_TEMPLATE);
}

const getDistrict = (place: GoogleMapsPlace) => {
    if (!place) {
        return '';
    }
    const COMPONENT_TEMPLATE = {
        administrative_area_level_2:
            'short_name'
    };
    return getAddrComponent(place, COMPONENT_TEMPLATE);
}

const getCountryShort = (place: GoogleMapsPlace) => {
    if (!place) {
        return '';
    }
    const COMPONENT_TEMPLATE = {country: 'short_name'};
    return getAddrComponent(place, COMPONENT_TEMPLATE);
}

const getCountry = (place: GoogleMapsPlace) => {
    if (!place) {
        return '';
    }
    const COMPONENT_TEMPLATE = {country: 'long_name'};
    return getAddrComponent(place, COMPONENT_TEMPLATE);
}

const getPostCode = (place: GoogleMapsPlace) => {
    if (!place) {
        return '';
    }
    const COMPONENT_TEMPLATE = {postal_code: 'long_name'};
    return getAddrComponent(place, COMPONENT_TEMPLATE);
}

const getPhone = (place: GoogleMapsPlace) => {
    if (!place) {
        return '';
    }
    return place?.formatted_phone_number || '';
}

const getWebSite = (place: GoogleMapsPlace) => {
    if (!place) {
        return '';
    }
    return place?.website || '';
}

const getGmapObj = (place: GoogleMapsPlace) => {
    if (!place) {
        return '';
    }
    const description = place.formatted_address;
    const lat = place.geometry.location.lat;
    const lng = place.geometry.location.lng;
    const placeId = place.place_id;
    const geometry = place.geometry;
    return {
        description,
        lat,
        lng,
        placeId,
        details: {
            geometry,
        }
    }
}


export {
    getAddrComponent,
    getStreetNumber,
    getStreet,
    getAddress,
    getCity,
    getState,
    getDistrict,
    getCountryShort,
    getCountry,
    getPostCode,
    getPhone,
    getWebSite,
    getGmapObj,
}
