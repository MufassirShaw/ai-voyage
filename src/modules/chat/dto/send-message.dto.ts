export class ChatDocumentDto {
  title: string;
  content: string;
}

export class SendMessageDto {
  message: string;
  documents?: ChatDocumentDto[];
}
