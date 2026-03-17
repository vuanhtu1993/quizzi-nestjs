import { Controller, Get, Post, Body, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { HostGuard } from '../common/guards/host.guard';
import { JoinCodeValidationPipe } from '../common/pipes/join-code.pipe';
import { Participant } from '../common/decorators/participant.decorator';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get()
  findAll() {
    return this.quizService.findAll();
  }

  @Post()
  create(@Body('title') title: string) {
    return this.quizService.create(title);
  }

  @Post(':id/start')
  @UseGuards(HostGuard) // [GUARD] Áp dụng Guard: Chỉ request có header 'x-role: host' mới được đi qua
  startQuiz(@Param('id') id: string) {
    return this.quizService.startQuiz(id);
  }

  @Post('join/:pin')
  join(
    // [PIPE] Áp dụng Pipe để xác nhận định dạng mã tham gia
    @Param('pin', JoinCodeValidationPipe) pin: string,
    // [DECORATOR] Lấy tên người tham gia (Được trích xuất từ Middleware x-participant-name)
    @Participant() participantName: string,
  ) {
    if (!participantName) {
      throw new BadRequestException('Bạn cần cung cấp tên để tham gia (Header: x-participant-name)');
    }
    return this.quizService.join(pin, participantName);
  }
}
