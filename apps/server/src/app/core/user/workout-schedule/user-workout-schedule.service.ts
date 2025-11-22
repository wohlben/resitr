import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserWorkoutScheduleRepository } from '../../persistence/repositories/user-workout-schedule.repository';
import { UserWorkoutSchedule } from '../../persistence/schemas/user-workout-schedule.schema';

@Injectable()
export class UserWorkoutScheduleService {
  constructor(
    private readonly scheduleRepository: UserWorkoutScheduleRepository
  ) {}

  async createSchedule(
    userId: string,
    workoutTemplateId: string,
    dayOfWeek: number,
    order = 0
  ): Promise<UserWorkoutSchedule> {
    // Check if user already has this workout scheduled
    const existingSchedules = await this.scheduleRepository.findByUserId(userId);
    const alreadyScheduled = existingSchedules.find(
      (s) => s.workoutTemplateId === workoutTemplateId
    );

    if (alreadyScheduled) {
      throw new ConflictException(
        'This workout is already scheduled. Delete the existing schedule first to reschedule.'
      );
    }

    return this.scheduleRepository.create({
      userId,
      workoutTemplateId,
      dayOfWeek,
      order,
    });
  }

  async getUserSchedules(userId: string): Promise<UserWorkoutSchedule[]> {
    return this.scheduleRepository.findByUserId(userId);
  }

  async getUserSchedulesByDay(
    userId: string,
    dayOfWeek: number
  ): Promise<UserWorkoutSchedule[]> {
    return this.scheduleRepository.findByUserIdAndDay(userId, dayOfWeek);
  }

  async getScheduleById(
    userId: string,
    scheduleId: string
  ): Promise<UserWorkoutSchedule> {
    const schedule = await this.scheduleRepository.findById(scheduleId);

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (schedule.userId !== userId) {
      throw new NotFoundException('Schedule not found');
    }

    return schedule;
  }

  async updateSchedule(
    userId: string,
    scheduleId: string,
    dayOfWeek?: number,
    order?: number
  ): Promise<UserWorkoutSchedule> {
    const schedule = await this.getScheduleById(userId, scheduleId);

    const updateData: { dayOfWeek?: number; order?: number } = {};
    if (dayOfWeek !== undefined) updateData.dayOfWeek = dayOfWeek;
    if (order !== undefined) updateData.order = order;

    const updated = await this.scheduleRepository.update(schedule.id, updateData);

    if (!updated) {
      throw new NotFoundException('Failed to update schedule');
    }

    return updated;
  }

  async deleteSchedule(userId: string, scheduleId: string): Promise<void> {
    const schedule = await this.getScheduleById(userId, scheduleId);
    await this.scheduleRepository.delete(schedule.id);
  }

  async deleteUserSchedulesByWorkout(
    userId: string,
    workoutTemplateId: string
  ): Promise<void> {
    await this.scheduleRepository.deleteByUserIdAndWorkoutId(
      userId,
      workoutTemplateId
    );
  }

  async deleteAllUserSchedules(userId: string): Promise<void> {
    await this.scheduleRepository.deleteByUserId(userId);
  }
}
