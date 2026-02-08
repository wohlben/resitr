import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { WorkoutScheduleRepository } from '../../persistence/repositories/workout-schedule.repository';
import { WorkoutScheduleCriteriaRepository } from '../../persistence/repositories/workout-schedule-criteria.repository';
import { WorkoutScheduleCriteriaDayOfWeekRepository } from '../../persistence/repositories/workout-schedule-criteria-day-of-week.repository';
import { WorkoutSchedule } from '../../persistence/schemas/workout-schedule.schema';
import { WorkoutScheduleCriteria } from '../../persistence/schemas/workout-schedule-criteria.schema';

export interface ScheduleWithCriteria {
  schedule: WorkoutSchedule;
  criteria: Array<{
    criteria: WorkoutScheduleCriteria;
    daysOfWeek: number[];
  }>;
}

@Injectable()
export class WorkoutScheduleService {
  constructor(
    private readonly scheduleRepository: WorkoutScheduleRepository,
    private readonly criteriaRepository: WorkoutScheduleCriteriaRepository,
    private readonly dayOfWeekRepository: WorkoutScheduleCriteriaDayOfWeekRepository
  ) {}

  async createSchedule(userId: string, userWorkoutId: string): Promise<WorkoutSchedule> {
    // Check if user already has this workout scheduled
    const existingSchedule = await this.scheduleRepository.findByUserIdAndUserWorkoutId(userId, userWorkoutId);

    if (existingSchedule) {
      throw new ConflictException(
        'This workout is already scheduled. Delete the existing schedule first to reschedule.'
      );
    }

    return this.scheduleRepository.create({
      userId,
      userWorkoutId,
    });
  }

  async getUserSchedules(userId: string): Promise<ScheduleWithCriteria[]> {
    const schedules = await this.scheduleRepository.findByUserId(userId);
    return this.populateCriteria(schedules);
  }

  async getUserSchedulesByDay(userId: string, dayOfWeek: number): Promise<ScheduleWithCriteria[]> {
    const allSchedules = await this.getUserSchedules(userId);
    // Filter schedules that have a criteria with the specified day
    return allSchedules.filter((schedule) => schedule.criteria.some((c) => c.daysOfWeek.includes(dayOfWeek)));
  }

  async getScheduleById(userId: string, scheduleId: string): Promise<ScheduleWithCriteria> {
    const schedule = await this.scheduleRepository.findById(scheduleId);

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (schedule.userId !== userId) {
      throw new NotFoundException('Schedule not found');
    }

    const schedulesWithCriteria = await this.populateCriteria([schedule]);
    return schedulesWithCriteria[0];
  }

  async deleteSchedule(userId: string, scheduleId: string): Promise<void> {
    const schedule = await this.getScheduleById(userId, scheduleId);
    await this.scheduleRepository.delete(schedule.schedule.id);
  }

  async deleteUserSchedulesByUserWorkout(userId: string, userWorkoutId: string): Promise<void> {
    await this.scheduleRepository.deleteByUserIdAndUserWorkoutId(userId, userWorkoutId);
  }

  async deleteAllUserSchedules(userId: string): Promise<void> {
    await this.scheduleRepository.deleteByUserId(userId);
  }

  private async populateCriteria(schedules: WorkoutSchedule[]): Promise<ScheduleWithCriteria[]> {
    if (schedules.length === 0) return [];

    const scheduleIds = schedules.map((s) => s.id);
    const allCriteria: ScheduleWithCriteria['criteria'] = [];
    const criteriaByScheduleId = new Map<string, ScheduleWithCriteria['criteria']>();

    // Fetch all criteria for these schedules
    for (const scheduleId of scheduleIds) {
      const criteriaList = await this.criteriaRepository.findByScheduleId(scheduleId);
      const criteriaIds = criteriaList.map((c) => c.id);
      const daysList = await this.dayOfWeekRepository.findByCriteriaIds(criteriaIds);

      const scheduleCriteria: ScheduleWithCriteria['criteria'] = criteriaList.map((criteria) => ({
        criteria,
        daysOfWeek: daysList.filter((d) => d.criteriaId === criteria.id).map((d) => d.dayOfWeek),
      }));

      criteriaByScheduleId.set(scheduleId, scheduleCriteria);
    }

    return schedules.map((schedule) => ({
      schedule,
      criteria: criteriaByScheduleId.get(schedule.id) ?? [],
    }));
  }
}
