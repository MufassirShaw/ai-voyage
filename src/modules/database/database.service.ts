import { Injectable } from '@nestjs/common';
import {
  DataSource,
  DeepPartial,
  EntityManager,
  EntityTarget,
  FindManyOptions,
  FindOptionsWhere,
  ObjectLiteral,
  QueryDeepPartialEntity,
  UpdateResult,
} from 'typeorm';

@Injectable()
export class DatabaseService {
  constructor(private readonly dataSource: DataSource) {}

  createOne<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    data: DeepPartial<T>,
  ): Promise<T> {
    const repo = this.dataSource.getRepository(entity);
    return repo.save(repo.create(data));
  }

  createMany<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    data: DeepPartial<T>[],
  ): Promise<T[]> {
    const repo = this.dataSource.getRepository(entity);
    return repo.save(repo.create(data));
  }

  findOne<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    where: FindOptionsWhere<T>,
  ): Promise<T | null> {
    return this.dataSource.getRepository(entity).findOneBy(where);
  }

  findMany<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    options?: FindManyOptions<T>,
  ): Promise<T[]> {
    return this.dataSource.getRepository(entity).find(options);
  }

  async updateOne<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    where: FindOptionsWhere<T>,
    data: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    return this.dataSource.getRepository(entity).update(where, data);
  }

  async deleteOne<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    where: FindOptionsWhere<T>,
  ): Promise<void> {
    await this.dataSource.getRepository(entity).delete(where);
  }

  transaction<T>(work: (em: EntityManager) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(work);
  }
}
