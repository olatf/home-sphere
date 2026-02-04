'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { BrandButton } from '@/components/common/BrandButton';
import { Input } from '@/components/ui/input';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { ValidUrlCheck } from '@/helpers/urls.helpers';

import {
  Trash2,
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Image as ImageIcon,
  TextAlignCenter,
  TextAlignJustify,
  TextAlignStart,
  TextAlignEnd,
  RotateCcw,
  RotateCw,
} from 'lucide-react';

import DOMPurify from 'dompurify';

interface Props {
  initialContent?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  maxChars?: number;
}

interface LinkUrlState {
  ImageLink: string;
  Link: string;
  setfor: 'image' | 'link';
}

export default function RichTextEditor({
  initialContent = '',
  onChange,
  placeholder = 'Write something great...',
  maxChars,
}: Props) {
  // extend textAlign to support justify
  const CustomTextAlign = TextAlign.extend({
    addOptions() {
      return {
        ...this.parent?.(),
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      };
    },
  });
  // extend image to support width and height
  const CustomImage = Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        width: {
          default: 'auto',
          parseHTML: element => element.getAttribute('width') || 'auto',
          renderHTML: attributes => {
            if (!attributes.width) return {};
            return { width: attributes.width };
          },
        },
        height: {
          default: 'auto',
          parseHTML: element => element.getAttribute('height') || 'auto',
          renderHTML: attributes => {
            if (!attributes.height) return {};
            return { height: attributes.height };
          },
        },
      };
    },
  });

  const editor = useEditor({
    immediatelyRender: false, // important for SSR + Next.js
    extensions: [
      StarterKit,
      CustomTextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Link.configure({
        autolink: true,
        openOnClick: true,
      }),
      CustomImage,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({
        limit: maxChars ?? undefined,
      }),
    ],
    content: initialContent || '<p></p>',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const clean = DOMPurify.sanitize(html);
      onChange?.(clean);
    },
  });

  const [linkUrl, setLinkUrl] = useState<LinkUrlState>({
    ImageLink: '',
    Link: '',
    setfor: 'link',
  });

  const [showLinkInput, setShowLinkInput] = useState(false);

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) return null;

  const addImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const safeUrl = ValidUrlCheck(linkUrl.ImageLink);

    if (safeUrl) {
      editor
        .chain()
        .focus()
        .setImage({ src: safeUrl, width: 400, height: 250 })
        .run();
    } else {
      console.warn('Invalid image URL');
    }

    setShowLinkInput(false);
    setLinkUrl(prev => ({ ...prev, ImageLink: '' }));
  };

  const setLink = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const safeUrl = ValidUrlCheck(linkUrl.Link);
    if (safeUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: safeUrl, target: '_blank' })
        .run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setShowLinkInput(false);
    setLinkUrl(prev => ({ ...prev, Link: '' }));
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded px-3 py-1 ${
            editor.isActive('bold') ? 'text-brand bg-gray-200' : 'bg-white'
          }`}
          type="button"
        >
          <Bold size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded px-3 py-1 ${
            editor.isActive('italic') ? 'text-brand bg-gray-200' : 'bg-white'
          }`}
          type="button"
        >
          <Italic size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`rounded px-3 py-1 ${
            editor.isActive('underline') ? 'text-brand bg-gray-200' : 'bg-white'
          }`}
          type="button"
        >
          U
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`rounded px-3 py-1 ${
            editor.isActive('heading', { level: 3 })
              ? 'text-brand bg-gray-200'
              : 'bg-white'
          }`}
          type="button"
        >
          H2
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded px-3 py-1 ${
            editor.isActive('bulletList')
              ? 'text-brand bg-gray-200'
              : 'bg-white'
          }`}
          type="button"
        >
          <List size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded px-3 py-1 ${
            editor.isActive('orderedList')
              ? 'text-brand bg-gray-200'
              : 'bg-white'
          }`}
          type="button"
        >
          <ListOrdered size={16} />
        </button>

        <button
          onClick={() => {
            setShowLinkInput(s => !s);
            setLinkUrl(prev => ({ ...prev, setfor: 'link' }));
          }}
          className="rounded bg-white px-3 py-1"
          type="button"
        >
          <LinkIcon size={16} />
        </button>

        <button
          onClick={() => {
            setShowLinkInput(s => !s);
            setLinkUrl(prev => ({ ...prev, setfor: 'image' }));
          }}
          className="rounded bg-white px-3 py-1"
        >
          <ImageIcon size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="rounded bg-white px-3 py-1"
          type="button"
        >
          <RotateCcw size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="rounded bg-white px-3 py-1"
          type="button"
        >
          <RotateCw size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`rounded px-3 py-1 ${
            editor.isActive('taskList') ? 'bg-gray-200' : 'bg-white'
          }`}
          type="button"
        >
          Tasks
        </button>

        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className="rounded bg-white px-3 py-1"
          type="button"
        >
          P
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className="rounded bg-white px-3 py-1"
          type="button"
        >
          <TextAlignStart size={16} className="text-brand mx-auto" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className="rounded bg-white px-3 py-1"
          type="button"
        >
          <TextAlignCenter size={16} className="text-brand mx-auto" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className="rounded bg-white px-3 py-1"
          type="button"
        >
          <TextAlignEnd size={16} className="text-brand mx-auto" />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className="rounded bg-white px-3 py-1"
          type="button"
        >
          <TextAlignJustify size={16} className="text-brand mx-auto" />
        </button>
      </div>

      {/* Link input */}
      {showLinkInput && (
        <div className="mb-3 flex gap-2">
          <Input
            type="text"
            value={linkUrl.ImageLink || linkUrl.Link}
            onChange={e => {
              setLinkUrl(prev => ({
                ...prev,
                [linkUrl.setfor === 'image' ? 'ImageLink' : 'Link']:
                  e.target.value,
              }));
            }}
            // Label="Config Url"
            placeholder={
              linkUrl.setfor === 'link'
                ? 'https://example.com'
                : 'https://example.com/image.jpg'
            }
            className="border-none outline-none focus:ring-1"
          />

          <BrandButton
            onClick={linkUrl.setfor === 'image' ? addImage : setLink}
          >
            Apply
          </BrandButton>
        </div>
      )}

      {/* Editor content */}
      <div className="prose min-h-125 max-w-4xl rounded-md border bg-white p-3 shadow-sm">
        <EditorContent editor={editor} className="h-full" />
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
        <div>
          {maxChars ? (
            <span>
              {editor.storage.characterCount.characters()} / {maxChars}{' '}
              characters
            </span>
          ) : (
            <span>{editor.storage.characterCount.characters()} characters</span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              const raw = editor.getHTML();
              const clean = DOMPurify.sanitize(raw);
              navigator.clipboard?.writeText(clean);
              toast.success('HTML copied to clipboard (sanitized)! 🎉');
            }}
            className="rounded bg-gray-100 px-3 py-1"
            type="button"
          >
            Copy HTML
          </button>

          <button
            onClick={() => editor.commands.clearContent()}
            className="flex items-center gap-1 rounded bg-red-50 px-3 py-1 text-red-600"
            type="button"
          >
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>
    </div>
  );
}
