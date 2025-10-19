'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Link as LinkIcon,
  Table as TableIcon,
  Minus,
  Undo,
  Redo,
} from 'lucide-react';
import ImageUploader from './ImageUploader';

interface EditorToolbarProps {
  editor: Editor;
}

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  const [showImageUploader, setShowImageUploader] = useState(false);

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-primary-100 text-primary-700'
          : 'text-gray-700 hover:bg-gray-100'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  const handleImageUpload = (url: string) => {
    editor.chain().focus().setImage({ src: url }).run();
    setShowImageUploader(false);
  };

  const addLink = () => {
    const url = window.prompt('링크 URL을 입력하세요:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-3 bg-gray-50 border-b border-gray-200">
      {/* Undo/Redo */}
      <div className="flex items-center gap-1 mr-2 pr-2 border-r border-gray-300">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="실행 취소 (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="다시 실행 (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Text Formatting */}
      <div className="flex items-center gap-1 mr-2 pr-2 border-r border-gray-300">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="굵게 (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="기울임 (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="취소선"
        >
          <Underline className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Headings */}
      <div className="flex items-center gap-1 mr-2 pr-2 border-r border-gray-300">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="제목 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="제목 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="제목 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Lists */}
      <div className="flex items-center gap-1 mr-2 pr-2 border-r border-gray-300">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="글머리 기호 목록"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="번호 매기기 목록"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Insert Elements */}
      <div className="flex items-center gap-1">
        <ToolbarButton onClick={() => setShowImageUploader(true)} title="이미지 업로드">
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addLink} title="링크 삽입">
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addTable} title="표 삽입">
          <TableIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="구분선 삽입"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Image Upload Modal */}
      {showImageUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">이미지 업로드</h3>
              <button
                onClick={() => setShowImageUploader(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <ImageUploader
              onImageUpload={handleImageUpload}
              onCancel={() => setShowImageUploader(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
