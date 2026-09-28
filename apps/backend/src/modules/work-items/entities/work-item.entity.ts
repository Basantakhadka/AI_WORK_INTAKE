import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WorkItemStatus } from '../enums/work-item-status.enum';
import { WorkItemStatusHistory } from './work-item-status-history.entity';

@Entity({ name: 'work_items' })
@Index(['status'])
@Index(['createdAt'])
export class WorkItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'external_id', unique: true })
  externalId!: string;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'enum', enum: WorkItemStatus, default: WorkItemStatus.RECEIVED })
  status!: WorkItemStatus;

  @Column({ type: 'varchar', nullable: true })
  category!: string | null;

  @Column({ type: 'varchar', nullable: true })
  priority!: string | null;

  @Column({ type: 'text', nullable: true })
  summary!: string | null;

  @Column({ name: 'recommended_action', type: 'text', nullable: true })
  recommendedAction!: string | null;

  @Column({ name: 'ai_error', type: 'text', nullable: true })
  aiError!: string | null;

  @Column({ name: 'ai_attempts', type: 'int', default: 0 })
  aiAttempts!: number;

  @Column({ name: 'analysed_at', type: 'timestamp', nullable: true })
  analysedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => WorkItemStatusHistory, (history) => history.workItem)
  statusHistory!: WorkItemStatusHistory[];
}
