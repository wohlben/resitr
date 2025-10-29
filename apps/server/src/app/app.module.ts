import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { CompendiumModule } from './routes/compendium/compendium.module';

@Module({
  imports: [CoreModule, CompendiumModule],
})
export class AppModule {}
