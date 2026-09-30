import { ConflictException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { WorkItemsRepository } from './work-items.repository';

describe('WorkItemsRepository', () => {
  const externalId = 'CRM-12345';

  function buildRepository(overrides: { save?: jest.Mock; findOne?: jest.Mock } = {}) {
    const workItems = {
      create: jest.fn((data) => data),
      save: overrides.save ?? jest.fn(),
      findOne: overrides.findOne ?? jest.fn(),
      findAndCount: jest.fn(),
      update: jest.fn(),
    };
    const dataSource = { transaction: jest.fn() };
    const repository = new WorkItemsRepository(workItems as any, dataSource as any);
    return { repository, workItems, dataSource };
  }

  it('does not create a duplicate when externalId already exists (concurrent insert)', async () => {
    // Simulates the row that already committed by the time our insert's
    // unique constraint fires — the real scenario for two near-simultaneous
    // requests with the same externalId.
    const duplicateError = new QueryFailedError('INSERT INTO "work_items" ...', [], {
      name: 'error',
      code: '23505',
    } as never);
    const existing = { id: 'existing-id', externalId };

    const { repository, workItems } = buildRepository({
      save: jest.fn().mockRejectedValue(duplicateError),
      findOne: jest.fn().mockResolvedValue(existing),
    });

    await expect(repository.create({ externalId, title: 't', description: 'd' })).rejects.toThrow(ConflictException);

    expect(workItems.save).toHaveBeenCalledTimes(1);
    expect(workItems.findOne).toHaveBeenCalledWith({ where: { externalId } });
  });

  it('rethrows errors unrelated to the unique constraint', async () => {
    const connectionError = new Error('connection terminated');
    const { repository } = buildRepository({ save: jest.fn().mockRejectedValue(connectionError) });

    await expect(repository.create({ externalId, title: 't', description: 'd' })).rejects.toThrow(
      'connection terminated',
    );
  });
});
