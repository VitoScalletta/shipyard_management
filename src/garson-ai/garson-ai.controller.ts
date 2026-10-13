import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GarsonAiService } from './garson-ai.service';
import { Controller, Post, Body, UnauthorizedException, UseGuards, Req } from '@nestjs/common';

@Controller('garson')
export class GarsonAiController {
  constructor(private readonly garsonAiService: GarsonAiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('chat')
  async chatWithGarson(@Body('message') message: string, @Req() req: any) {
    if (!message) {
      throw new UnauthorizedException('Mesaj boş olamaz');
    }

    const userId = req.user.id;
    const role = req.user.role;

    const response = await this.garsonAiService.processUserMessage(
      userId,
      role,
      message,
    );

    return {
      success: true,
      data: response,
    };
  }
}
