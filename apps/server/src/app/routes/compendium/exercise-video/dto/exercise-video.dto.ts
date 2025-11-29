import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VideoSource, type CreateExerciseVideoDto as CreateExerciseVideoDtoType, type ExerciseVideoResponseDto } from '@resitr/api';

export class CreateExerciseVideoDto implements CreateExerciseVideoDtoType {
  @ApiProperty({ description: 'Exercise template ID this video belongs to' })
  @IsString()
  exerciseTemplateId!: string;

  @ApiProperty({ description: 'URL to the video' })
  @IsUrl()
  url!: string;

  @ApiProperty({ description: 'Video title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Video description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Video source platform', enum: VideoSource, required: false })
  @IsOptional()
  @IsEnum(VideoSource)
  video_source?: VideoSource;
}

export class CreateExerciseVideoResponseDto extends CreateExerciseVideoDto implements ExerciseVideoResponseDto {
  @ApiProperty({ description: 'User ID of the creator' })
  @IsString()
  createdBy!: string;

  @ApiProperty({ description: 'Creation timestamp in ISO format' })
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  @IsString()
  createdAt!: string;
}
