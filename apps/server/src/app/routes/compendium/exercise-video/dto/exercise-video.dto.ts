import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { VideoSource } from '@resitr/api';

export class CreateExerciseVideoDto {
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

export class CreateExerciseVideoResponseDto extends CreateExerciseVideoDto {
  @IsString()
  createdBy!: string;

  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  @IsString()
  createdAt!: string;
}
