// 채용공고 WYSIWYG 에디터 컨텐츠 블록 타입

export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'list'
  | 'divider'
  | 'table'
  | 'video';

export type BlockAlignment = 'left' | 'center' | 'right' | 'full';

// 블록별 컨텐츠 구조
export type BlockContent =
  | HeadingContent
  | ParagraphContent
  | ImageContent
  | ListContent
  | DividerContent
  | TableContent
  | VideoContent;

export interface HeadingContent {
  level: 1 | 2 | 3;
  text: string;
}

export interface ParagraphContent {
  html: string;
}

export interface ImageContent {
  url: string;
  caption?: string;
  alignment: BlockAlignment;
  width?: number;
  height?: number;
}

export interface ListContent {
  items: string[];
  ordered: boolean;
}

export interface DividerContent {
  style: 'solid' | 'dashed' | 'dotted';
}

export interface TableContent {
  headers: string[];
  rows: string[][];
}

export interface VideoContent {
  url: string;
  thumbnail?: string;
  provider: 'youtube' | 'vimeo';
}

// 데이터베이스 구조
export interface JobContentBlock {
  id: string;
  job_id: string;
  type: BlockType;
  order_index: number;
  content: BlockContent;
  created_at: string;
  updated_at: string;
}

// 에디터에서 사용하는 블록 (id 없이)
export interface EditorBlock {
  type: BlockType;
  order_index: number;
  content: BlockContent;
}
