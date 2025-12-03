export default function clubMainColor(clubHouse: any) {
    if (clubHouse) {
        return (clubHouse.header_text_color && clubHouse.header_text_color === '#FFFFFF') ? `${clubHouse.primary_color}` : `${clubHouse.secondary_color}`;
    }
    return '#000000';
}
