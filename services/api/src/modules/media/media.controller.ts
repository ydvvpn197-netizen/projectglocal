import { Controller, Get, Query } from '@nestjs/common';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get('signed-upload')
  async signedUpload(@Query('key') key: string, @Query('type') type: string) {
    const url = await this.media.getSignedUploadUrl(key, type);
    return { url };
  }
}



