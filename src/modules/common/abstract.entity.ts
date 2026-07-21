import { PrimaryGeneratedColumn } from 'typeorm';

export class AbstractEntity<T> {
  @PrimaryGeneratedColumn()
  id: string;

  constructor(data: Partial<T>) {
    Object.assign(this, data);
  }
}
