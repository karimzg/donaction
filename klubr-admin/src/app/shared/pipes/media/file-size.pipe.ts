import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize',
  standalone: true
})
export class FileSizePipe implements PipeTransform {

  transform(sizeInBytes: number): unknown {
    const kiloBytes = sizeInBytes / 1024;
    const megaBytes = kiloBytes / 1024;
    return (megaBytes >= 1) ? `${megaBytes.toFixed(2)} Mo` : `${kiloBytes.toFixed(2)} Ko`;
  }

}
