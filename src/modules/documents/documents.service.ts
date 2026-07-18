import { Injectable, NotFoundException } from '@nestjs/common';

import { DocumentRepository } from './document.repository';

@Injectable()
export class DocumentsService {
  constructor(private readonly documentRepository: DocumentRepository) {}

  async findAll() {
    const docs = await this.documentRepository.findAll();
    return {
      documents: docs.map((d) => ({
        id: d.id,
        title: d.title,
        status: d.status,
        createdAt: d.createdAt,
      })),
    };
  }

  async findById(id: string) {
    const doc = await this.documentRepository.findById(id);
    if (!doc) {
      throw new NotFoundException(`Document ${id} not found`);
    }

    return {
      id: doc.id,
      title: doc.title,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
