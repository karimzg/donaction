export const MEDIAS_TRANSFORMATIONS = Object.freeze({
    AVATAR: "w-100,h-100,f-auto",
    EMAIL_PROJECT_COVER: "h-320,f-auto",
    EMAIL_CLUB_LOGO: "h-150",
    CONVERT_PNG: "f-png",
    POSTER_IMG: "w-1150,h-800,f-auto",
    POSTER_LOGO: "h-120,f-auto",
});
export const getMediaPath = (media: any, transformation: string) => {
    return media?.provider_metadata?.filePath
        ? `${process.env.IMAGEKIT_URL_ENDPOINT}/tr:${transformation || "w-500"}${
            media.provider_metadata.filePath
        }`
        : media?.url;
};

export const checkSvgAndTransform = (media: any, transformations: Array<string>) => {
    if (!media || !media?.url) return "";
    if (media?.url?.includes(".svg")) {
        return getMediaPath(
            media,
            [MEDIAS_TRANSFORMATIONS.CONVERT_PNG, ...(transformations || [])].join()
        );
    }
    return getMediaPath(media, (transformations || []).join());
};
