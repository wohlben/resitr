import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkoutScheduleCriteriaRepository } from '../../persistence/repositories/workout-schedule-criteria.repository';
import { WorkoutScheduleCriteriaDayOfWeekRepository } from '../../persistence/repositories/workout-schedule-criteria-day-of-week.repository';
import {
  WorkoutScheduleCriteria,
  ScheduleCriteriaType,
} from '../../persistence/schemas/workout-schedule-criteria.schema';

export interface CriteriaWithDays {
  criteria: WorkoutScheduleCriteria;
  daysOfWeek: number[];
}

@Injectable()
export class WorkoutScheduleCriteriaService {
  constructor(
    private readonly criteriaRepository: WorkoutScheduleCriteriaRepository,
    private readonly dayOfWeekRepository: WorkoutScheduleCriteriaDayOfWeekRepository
  ) {}

  async createCriteria(
    scheduleId: string,
    type: ScheduleCriteriaType,
    daysOfWeek: number[]
  ): Promise<CriteriaWithDays> {
    if (type !== 'DAY_OF_WEEK') {
      throw new BadRequestException('Only DAY_OF_WEEK criteria type is supported');
    }

    if (!daysOfWeek || daysOfWeek.length === 0) {
      throw new BadRequestException('At least one day of week is required');
    }

    // Validate day values (0-6)
    const invalidDays = daysOfWeek.filter((d) => d < 0 || d > 6);
    if (invalidDays.length > 0) {
      throw new BadRequestException(`Invalid day values: ${invalidDays.join(', ')}. Must be 0-6.`);
    }

    // Get next order for this schedule
    const order = await this.criteriaRepository.getNextOrderForSchedule(scheduleId);

    // Create criteria
    const criteria = await this.criteriaRepository.create({
      scheduleId,
      type,
      order,
    });

    // Create day of week entries
    const dayEntries = daysOfWeek.map((day) => ({
      criteriaId: criteria.id,
      dayOfWeek: day,
    }));
    await this.dayOfWeekRepository.createMany(dayEntries);

    return {
      criteria,
      daysOfWeek,
    };
  }

  async getCriteriaByScheduleId(scheduleId: string): Promise<CriteriaWithDays[]> {
    const criteriaList = await this.criteriaRepository.findByScheduleId(scheduleId);

    if (criteriaList.length === 0) return [];

    const criteriaIds = criteriaList.map((c) => c.id);
    const allDays = await this.dayOfWeekRepository.findByCriteriaIds(criteriaIds);

    return criteriaList.map((criteria) => ({
      criteria,
      daysOfWeek: allDays.filter((d) => d.criteriaId === criteria.id).map((d) => d.dayOfWeek),
    }));
  }

  async getCriteriaById(scheduleId: string, criteriaId: string): Promise<CriteriaWithDays> {
    const criteria = await this.criteriaRepository.findByIdAndScheduleId(criteriaId, scheduleId);

    if (!criteria) {
      throw new NotFoundException('Criteria not found');
    }

    const days = await this.dayOfWeekRepository.findByCriteriaId(criteriaId);

    return {
      criteria,
      daysOfWeek: days.map((d) => d.dayOfWeek),
    };
  }

  async updateCriteria(
    scheduleId: string,
    criteriaId: string,
    type: ScheduleCriteriaType,
    daysOfWeek: number[],
    order: number
  ): Promise<CriteriaWithDays> {
    // Verify criteria exists and belongs to schedule
    const existingCriteria = await this.criteriaRepository.findByIdAndScheduleId(criteriaId, scheduleId);
    if (!existingCriteria) {
      throw new NotFoundException('Criteria not found');
    }

    if (type !== 'DAY_OF_WEEK') {
      throw new BadRequestException('Only DAY_OF_WEEK criteria type is supported');
    }

    if (!daysOfWeek || daysOfWeek.length === 0) {
      throw new BadRequestException('At least one day of week is required');
    }

    // Validate day values (0-6)
    const invalidDays = daysOfWeek.filter((d) => d < 0 || d > 6);
    if (invalidDays.length > 0) {
      throw new BadRequestException(`Invalid day values: ${invalidDays.join(', ')}. Must be 0-6.`);
    }

    // Update criteria (type and order)
    const updatedCriteria = await this.criteriaRepository.update(criteriaId, {
      type,
      order,
    });

    if (!updatedCriteria) {
      throw new NotFoundException('Failed to update criteria');
    }

    // Delete existing days and recreate
    await this.dayOfWeekRepository.deleteByCriteriaId(criteriaId);
    const dayEntries = daysOfWeek.map((day) => ({
      criteriaId,
      dayOfWeek: day,
    }));
    await this.dayOfWeekRepository.createMany(dayEntries);

    return {
      criteria: updatedCriteria,
      daysOfWeek,
    };
  }

  async deleteCriteria(scheduleId: string, criteriaId: string): Promise<void> {
    // Verify criteria exists and belongs to schedule
    const existingCriteria = await this.criteriaRepository.findByIdAndScheduleId(criteriaId, scheduleId);
    if (!existingCriteria) {
      throw new NotFoundException('Criteria not found');
    }

    await this.criteriaRepository.delete(criteriaId);
  }
}
