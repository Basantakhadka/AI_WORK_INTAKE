import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { WorkItem } from '../modules/work-items/entities/work-item.entity';
import { WorkItemStatusHistory } from '../modules/work-items/entities/work-item-status-history.entity';

config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [WorkItem, WorkItemStatusHistory],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
});
