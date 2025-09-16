import { Body, Controller, Post } from '@nestjs/common';

@Controller('events')
export class EventsController {
  @Post('book')
  async book(@Body() body: { eventId: string; userId: string; qty: number }) {
    // stub response for MVP scaffold
    return { ok: true, bookingId: 'stub-' + Date.now() };
  }
}



