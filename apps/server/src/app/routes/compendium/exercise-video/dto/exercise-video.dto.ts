import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { VideoSource, type CreateExerciseVideoDto as CreateExerciseVideoDtoType, type ExerciseVideoResponseDto } from '@resitr/api';

export class CreateExerciseVideoDto implements CreateExerciseVideoDtoType {
  @IsString()
  exerciseTemplateId!: string;

  @IsUrl()
  url!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(VideoSource)
  video_source?: VideoSource;
}

export class CreateExerciseVideoResponseDto extends CreateExerciseVideoDto implements ExerciseVideoResponseDto {
  @IsString()
  createdBy!: string;

  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  @IsString()
  createdAt!: string;
}
