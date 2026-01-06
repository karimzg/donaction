import { Pipe, PipeTransform } from '@angular/core';
import { Media } from "@shared/utils/models/media";

const providerURL = 'https://ik.imagekit.io/donaction/';
export type MediaPreset =
  'avatar'
  | 'avatar_big'
  | 'couv'
  | 'logo'
  | 'logo_2x'
  | 'project_card'
  | 'couv_project'
  | 'couv_project_xs'
  | 'col50'
  | 'partner'

@Pipe({
  name: 'media',
  standalone: true
})
export class MediaPipe implements PipeTransform {

  transform(media?: Partial<Media>, mediaPreset: MediaPreset = 'avatar', scale: '' | '2x' = ''): string {
    if (!media?.url) {
      switch (mediaPreset) {
        case 'avatar':
        case 'avatar_big':
          return 'assets/images/users/placeholder.svg';
        case 'logo':
        case 'logo_2x':
          return 'assets/images/placeholders/placeholder-klubr.svg';
        default:
          return 'assets/images/placeholders/placeholder-klubr.svg';
      }
    } else if (!media.provider_metadata?.filePath) {
      return media.url;
    }
    return `${providerURL}tr:n-${mediaPreset}${scale !== '' ? '_' + scale : ''}${media.provider_metadata.filePath}`;
  }

}
