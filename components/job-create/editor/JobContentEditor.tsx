'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import EditorToolbar from './EditorToolbar';

interface JobContentEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
}

export default function JobContentEditor({
  content,
  onChange,
  placeholder = '채용공고 상세 내용을 작성하세요...'
}: JobContentEditorProps) {
  const editor = useEditor({
    immediatelyRender: false, // SSR 환경에서 hydration mismatch 방지
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link text-primary-600 underline',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'editor-table border-collapse border border-gray-300',
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2 bg-gray-50 font-bold',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[400px] px-6 py-4',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
      <EditorToolbar editor={editor} />
      <div className="border-t border-gray-200">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
