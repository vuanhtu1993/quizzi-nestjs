import { Injectable } from '@nestjs/common';
import { QuizNotFoundException, QuizInvalidStateException } from './exceptions/quiz.exception';

export interface QuizRoom {
  id: string;
  joinCode: string;
  title: string;
  status: 'waiting' | 'playing' | 'finished';
  participants: string[];
}

@Injectable()
export class QuizService {
  // In-memory data store để giả lập database
  private readonly quizzes: QuizRoom[] = [];

  constructor() {
    // Dữ liệu mẫu (Seed)
    this.quizzes.push({
      id: 'quiz-1',
      joinCode: '123456',
      title: 'NestJS Fundamentals',
      status: 'waiting',
      participants: [],
    });
  }

  /**
   * Lấy danh sách tất cả các phòng Quiz
   */
  findAll(): QuizRoom[] {
    return this.quizzes;
  }

  /**
   * Lấy thông tin một phòng Quiz theo ID
   */
  findById(id: string): QuizRoom | undefined {
    return this.quizzes.find((q) => q.id === id);
  }

  /**
   * Tìm phòng theo Join Code (chuẩn bị cho việc tham gia)
   */
  findByJoinCode(joinCode: string): QuizRoom | undefined {
    return this.quizzes.find((q) => q.joinCode === joinCode);
  }

  /**
   * Tạo một phòng Quiz mới
   */
  create(title: string): QuizRoom {
    const newQuiz: QuizRoom = {
      id: `quiz-${Date.now()}`,
      joinCode: Math.floor(100000 + Math.random() * 900000).toString(), // Random 6 chữ số
      title,
      status: 'waiting',
      participants: [],
    };
    this.quizzes.push(newQuiz);
    return newQuiz;
  }

  /**
   * Tham gia vào phòng Quiz
   */
  join(joinCode: string, participantName: string): QuizRoom {
    const quiz = this.findByJoinCode(joinCode);
    if (!quiz) {
      // Phóng (throw) Exception theo chuẩn định dạng riêng thay vì Error thường
      throw new QuizNotFoundException();
    }

    if (quiz.status !== 'waiting') {
      throw new QuizInvalidStateException('Phòng Quiz đã bắt đầu hoặc đã kết thúc, không thể tham gia!');
    }

    if (!quiz.participants.includes(participantName)) {
      quiz.participants.push(participantName);
    }

    return quiz;
  }

  /**
   * Bắt đầu Quiz
   */
  startQuiz(id: string): QuizRoom {
    const quiz = this.findById(id);
    if (!quiz) {
      throw new QuizNotFoundException();
    }

    quiz.status = 'playing';
    return quiz;
  }
}
