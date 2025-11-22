import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { UserWorkoutLogController } from './workout-log/user-workout-log.controller';

@Module({
    imports: [CoreModule],
    controllers: [UserWorkoutLogController],
})
export class UserModule { }
