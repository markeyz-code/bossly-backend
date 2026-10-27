import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailLog, MailLogSchema } from './mail-log.schema';
import { MailService } from './mail.service';

@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: MailLog.name, schema: MailLogSchema }])],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
