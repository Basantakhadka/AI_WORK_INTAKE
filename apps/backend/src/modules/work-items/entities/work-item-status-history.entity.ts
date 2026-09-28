import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { WorkItemStatus } from '../enums/work-item-status.enum';
import { WorkItem } from './work-item.entity';

@Entity({ name: 'work_item_status_history' })
@Index(['workItemId', 'createdAt'])
export class WorkItemStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'work_item_id' })
  workItemId!: string;

  @Column({ name: 'from_status', type: 'enum', enum: WorkItemStatus, nullable: true })
  fromStatus!: WorkItemStatus | null;

  @Column({ name: 'to_status', type: 'enum', enum: WorkItemStatus })
  toStatus!: WorkItemStatus;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => WorkItem, (workItem) => workItem.statusHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'work_item_id' })
  workItem!: WorkItem;
}
