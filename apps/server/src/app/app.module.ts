import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { CompendiumModule } from './routes/compendium/compendium.module';
import { UserModule } from './routes/user/user.module';

@Module({
  imports: [CoreModule, CompendiumModule, UserModule],
})
export class AppModule { }
