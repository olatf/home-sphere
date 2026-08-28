// 'use client';

// import React, { useState, useEffect } from 'react';
// import { toast } from 'sonner';
// import { EditorContent, useEditor } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
// import Link from '@tiptap/extension-link';
// import Placeholder from '@tiptap/extension-placeholder';
// import CharacterCount from '@tiptap/extension-character-count';
// import Image from '@tiptap/extension-image';
// import TaskList from '@tiptap/extension-task-list';
// import TaskItem from '@tiptap/extension-task-item';
// import Underline from '@tiptap/extension-underline';
// import TextAlign from '@tiptap/extension-text-align';
// import { BrandButton } from '@/components/common/BrandButton';
// import { Input } from '@/components/ui/input';
// import { Table } from '@tiptap/extension-table';
// import { TableRow } from '@tiptap/extension-table-row';
// import { TableCell } from '@tiptap/extension-table-cell';
// import { TableHeader } from '@tiptap/extension-table-header';
// import { ValidUrlCheck } from '@/helpers/urls.helpers';

// import {
//   Trash2,
//   Bold,
//   Italic,
//   Link as LinkIcon,
//   List,
//   ListOrdered,
//   Image as ImageIcon,
//   TextAlignCenter,
//   TextAlignJustify,
//   TextAlignStart,
//   TextAlignEnd,
//   RotateCcw,
//   RotateCw,
// } from 'lucide-react';

// import DOMPurify from 'dompurify';

// interface Props {
//   initialContent?: string;
//   onChange?: (html: string) => void;
//   placeholder?: string;
//   maxChars?: number;
// }

// interface LinkUrlState {
//   ImageLink: string;
//   Link: string;
//   setfor: 'image' | 'link';
// }

// export const RichTextEditor = ({
//   initialContent = '',
//   onChange,
//   placeholder = 'Write something great...',
//   maxChars,
// }: Props) => {
//   // extend textAlign to support justify
//   const CustomTextAlign = TextAlign.extend({
//     addOptions() {
//       return {
//         ...this.parent?.(),
//         types: ['heading', 'paragraph'],
//         alignments: ['left', 'center', 'right', 'justify'],
//       };
//     },
//   });
//   // extend image to support width and height
//   const CustomImage = Image.extend({
//     addAttributes() {
//       return {
//         ...this.parent?.(),
//         width: {
//           default: 'auto',
//           parseHTML: element => element.getAttribute('width') || 'auto',
//           renderHTML: attributes => {
//             if (!attributes.width) return {};
//             return { width: attributes.width };
//           },
//         },
//         height: {
//           default: 'auto',
//           parseHTML: element => element.getAttribute('height') || 'auto',
//           renderHTML: attributes => {
//             if (!attributes.height) return {};
//             return { height: attributes.height };
//           },
//         },
//       };
//     },
//   });

//   const editor = useEditor({
//     immediatelyRender: false, // important for SSR + Next.js
//     extensions: [
//       StarterKit,
//       CustomTextAlign.configure({ types: ['heading', 'paragraph'] }),
//       Underline,
//       Link.configure({
//         autolink: true,
//         openOnClick: true,
//       }),
//       CustomImage,
//       TaskList,
//       TaskItem.configure({ nested: true }),
//       Table.configure({ resizable: true }),
//       TableRow,
//       TableHeader,
//       TableCell,
//       Placeholder.configure({ placeholder }),
//       CharacterCount.configure({
//         limit: maxChars ?? undefined,
//       }),
//     ],
//     content: initialContent || '<p></p>',
//     onUpdate: ({ editor }) => {
//       const html = editor.getHTML();
//       const clean = DOMPurify.sanitize(html);
//       onChange?.(clean);
//     },
//   });

//   const [linkUrl, setLinkUrl] = useState<LinkUrlState>({
//     ImageLink: '',
//     Link: '',
//     setfor: 'link',
//   });

//   const [showLinkInput, setShowLinkInput] = useState(false);

//   useEffect(() => {
//     return () => {
//       editor?.destroy();
//     };
//   }, [editor]);

//   if (!editor) return null;

//   const addImage = (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault();

//     const safeUrl = ValidUrlCheck(linkUrl.ImageLink);

//     if (safeUrl) {
//       editor
//         .chain()
//         .focus()
//         .setImage({ src: safeUrl, width: 400, height: 250 })
//         .run();
//     } else {
//       console.warn('Invalid image URL');
//     }

//     setShowLinkInput(false);
//     setLinkUrl(prev => ({ ...prev, ImageLink: '' }));
//   };

//   const setLink = (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault();
//     const safeUrl = ValidUrlCheck(linkUrl.Link);
//     if (safeUrl) {
//       editor
//         .chain()
//         .focus()
//         .extendMarkRange('link')
//         .setLink({ href: safeUrl, target: '_blank' })
//         .run();
//     } else {
//       editor.chain().focus().extendMarkRange('link').unsetLink().run();
//     }
//     setShowLinkInput(false);
//     setLinkUrl(prev => ({ ...prev, Link: '' }));
//   };

//   return (
//     <div className="mx-auto max-h-[200] w-full max-w-4xl">
//       {/* Toolbar */}
//       <div className="mb-3 flex flex-wrap items-center gap-2">
//         <button
//           onClick={() => editor.chain().focus().toggleBold().run()}
//           className={`rounded px-3 py-1 ${
//             editor.isActive('bold') ? 'text-brand bg-gray-200' : 'bg-white'
//           }`}
//           type="button"
//         >
//           <Bold size={16} />
//         </button>

//         <button
//           onClick={() => editor.chain().focus().toggleItalic().run()}
//           className={`rounded px-3 py-1 ${
//             editor.isActive('italic') ? 'text-brand bg-gray-200' : 'bg-white'
//           }`}
//           type="button"
//         >
//           <Italic size={16} />
//         </button>

//         <button
//           onClick={() => editor.chain().focus().toggleUnderline().run()}
//           className={`rounded px-3 py-1 ${
//             editor.isActive('underline') ? 'text-brand bg-gray-200' : 'bg-white'
//           }`}
//           type="button"
//         >
//           U
//         </button>

//         <button
//           onClick={() =>
//             editor.chain().focus().toggleHeading({ level: 2 }).run()
//           }
//           className={`rounded px-3 py-1 ${
//             editor.isActive('heading', { level: 3 })
//               ? 'text-brand bg-gray-200'
//               : 'bg-white'
//           }`}
//           type="button"
//         >
//           H2
//         </button>

//         <button
//           onClick={() => editor.chain().focus().toggleBulletList().run()}
//           className={`rounded px-3 py-1 ${
//             editor.isActive('bulletList')
//               ? 'text-brand bg-gray-200'
//               : 'bg-white'
//           }`}
//           type="button"
//         >
//           <List size={16} />
//         </button>

//         <button
//           onClick={() => editor.chain().focus().toggleOrderedList().run()}
//           className={`rounded px-3 py-1 ${
//             editor.isActive('orderedList')
//               ? 'text-brand bg-gray-200'
//               : 'bg-white'
//           }`}
//           type="button"
//         >
//           <ListOrdered size={16} />
//         </button>

//         <button
//           onClick={() => {
//             setShowLinkInput(s => !s);
//             setLinkUrl(prev => ({ ...prev, setfor: 'link' }));
//           }}
//           className="rounded bg-white px-3 py-1"
//           type="button"
//         >
//           <LinkIcon size={16} />
//         </button>

//         <button
//           onClick={() => {
//             setShowLinkInput(s => !s);
//             setLinkUrl(prev => ({ ...prev, setfor: 'image' }));
//           }}
//           className="rounded bg-white px-3 py-1"
//         >
//           <ImageIcon size={16} />
//         </button>

//         <button
//           onClick={() => editor.chain().focus().undo().run()}
//           className="rounded bg-white px-3 py-1"
//           type="button"
//         >
//           <RotateCcw size={16} />
//         </button>

//         <button
//           onClick={() => editor.chain().focus().redo().run()}
//           className="rounded bg-white px-3 py-1"
//           type="button"
//         >
//           <RotateCw size={16} />
//         </button>

//         <button
//           onClick={() => editor.chain().focus().toggleTaskList().run()}
//           className={`rounded px-3 py-1 ${
//             editor.isActive('taskList') ? 'bg-gray-200' : 'bg-white'
//           }`}
//           type="button"
//         >
//           Tasks
//         </button>

//         <button
//           onClick={() => editor.chain().focus().setParagraph().run()}
//           className="rounded bg-white px-3 py-1"
//           type="button"
//         >
//           P
//         </button>

//         <button
//           onClick={() => editor.chain().focus().setTextAlign('left').run()}
//           className="rounded bg-white px-3 py-1"
//           type="button"
//         >
//           <TextAlignStart size={16} className="text-brand mx-auto" />
//         </button>
//         <button
//           onClick={() => editor.chain().focus().setTextAlign('center').run()}
//           className="rounded bg-white px-3 py-1"
//           type="button"
//         >
//           <TextAlignCenter size={16} className="text-brand mx-auto" />
//         </button>
//         <button
//           onClick={() => editor.chain().focus().setTextAlign('right').run()}
//           className="rounded bg-white px-3 py-1"
//           type="button"
//         >
//           <TextAlignEnd size={16} className="text-brand mx-auto" />
//         </button>

//         <button
//           onClick={() => editor.chain().focus().setTextAlign('justify').run()}
//           className="rounded bg-white px-3 py-1"
//           type="button"
//         >
//           <TextAlignJustify size={16} className="text-brand mx-auto" />
//         </button>
//       </div>

//       {/* Link input */}
//       {showLinkInput && (
//         <div className="mb-3 flex gap-2">
//           <Input
//             type="text"
//             value={linkUrl.ImageLink || linkUrl.Link}
//             onChange={e => {
//               setLinkUrl(prev => ({
//                 ...prev,
//                 [linkUrl.setfor === 'image' ? 'ImageLink' : 'Link']:
//                   e.target.value,
//               }));
//             }}
//             // Label="Config Url"
//             placeholder={
//               linkUrl.setfor === 'link'
//                 ? 'https://example.com'
//                 : 'https://example.com/image.jpg'
//             }
//             className="border-none outline-none focus:ring-1"
//           />

//           <BrandButton
//             variant="ghost"
//             onClick={linkUrl.setfor === 'image' ? addImage : setLink}
//           >
//             Apply
//           </BrandButton>
//         </div>
//       )}

//       {/* Editor content */}
//       <div className="prose min-h-68 max-w-4xl rounded-md border bg-white p-3 shadow-sm">
//         <EditorContent editor={editor} className="h-1/2" />
//       </div>

//       {/* Footer */}
//       <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
//         <div>
//           {maxChars ? (
//             <span>
//               {editor.storage.characterCount.characters()} / {maxChars}{' '}
//               characters
//             </span>
//           ) : (
//             <span>{editor.storage.characterCount.characters()} characters</span>
//           )}
//         </div>

//         <div className="flex gap-2">
//           <BrandButton
//             variant="secondary"
//             onClick={() => {
//               const raw = editor.getHTML();
//               const clean = DOMPurify.sanitize(raw);
//               navigator.clipboard?.writeText(clean);
//               toast.success('HTML copied to clipboard (sanitized)! 🎉');
//             }}
//             type="button"
//           >
//             Copy HTML
//           </BrandButton>

//           <BrandButton
//             variant="ghost"
//             onClick={() => editor.commands.clearContent()}
//             className="flex items-center gap-1 rounded bg-red-50 px-3 py-1 text-red-600"
//             type="button"
//           >
//             <Trash2 size={14} /> Clear
//           </BrandButton>
//         </div>
//       </div>
//     </div>
//   );
// };

'use client';

import CharacterCount from '@tiptap/extension-character-count';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import DOMPurify from 'dompurify';
import {
  Bold,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  RotateCcw,
  RotateCw,
  TextAlignCenter,
  TextAlignEnd,
  TextAlignJustify,
  TextAlignStart,
  Trash2,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { BrandButton } from '@/components/common/BrandButton';
import { Input } from '@/components/ui/input';
import { ValidUrlCheck } from '@/helpers/urls.helpers';

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

export const RichTextEditor = ({
  initialContent = '',
  onChange,
  placeholder = 'Write something great...',
  maxChars,
}: Props) => {
  // Defined outside useEditor to avoid re-creating on every render
  const CustomTextAlign = TextAlign.extend({
    addOptions() {
      return {
        ...this.parent?.(),
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      };
    },
  });

  const CustomImage = Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        width: {
          default: 'auto',
          parseHTML: element => element.getAttribute('width') || 'auto',
          renderHTML: attributes =>
            !attributes.width ? {} : { width: attributes.width },
        },
        height: {
          default: 'auto',
          parseHTML: element => element.getAttribute('height') || 'auto',
          renderHTML: attributes =>
            !attributes.height ? {} : { height: attributes.height },
        },
      };
    },
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      CustomTextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Link.configure({ autolink: true, openOnClick: true }),
      CustomImage,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: maxChars ?? undefined }),
    ],
    content: initialContent || '<p></p>',
    onUpdate: ({ editor }) => {
      const clean = DOMPurify.sanitize(editor.getHTML());
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

  const toolbarBtn = (active: boolean) =>
    `rounded px-3 py-1 transition ${active ? 'bg-gray-200 text-brand' : 'bg-white hover:bg-gray-50'}`;

  return (
    // ── Outer wrapper: no max-h here, just width ──────────────────
    <div className="w-full">
      {/* Toolbar */}
      <div className="mb-2 flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 bg-gray-50 px-2 py-1.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={toolbarBtn(editor.isActive('bold'))}
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={toolbarBtn(editor.isActive('italic'))}
        >
          <Italic size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={toolbarBtn(editor.isActive('underline'))}
        >
          U
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={toolbarBtn(editor.isActive('heading', { level: 2 }))}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={toolbarBtn(editor.isActive('bulletList'))}
        >
          <List size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={toolbarBtn(editor.isActive('orderedList'))}
        >
          <ListOrdered size={14} />
        </button>

        <span className="mx-1 h-4 w-px bg-gray-200" />

        <button
          type="button"
          onClick={() => {
            setShowLinkInput(s => !s);
            setLinkUrl(prev => ({ ...prev, setfor: 'link' }));
          }}
          className={toolbarBtn(showLinkInput && linkUrl.setfor === 'link')}
        >
          <LinkIcon size={14} />
        </button>
        <button
          type="button"
          onClick={() => {
            setShowLinkInput(s => !s);
            setLinkUrl(prev => ({ ...prev, setfor: 'image' }));
          }}
          className={toolbarBtn(showLinkInput && linkUrl.setfor === 'image')}
        >
          <ImageIcon size={14} />
        </button>

        <span className="mx-1 h-4 w-px bg-gray-200" />

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={toolbarBtn(editor.isActive({ textAlign: 'left' }))}
        >
          <TextAlignStart size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={toolbarBtn(editor.isActive({ textAlign: 'center' }))}
        >
          <TextAlignCenter size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={toolbarBtn(editor.isActive({ textAlign: 'right' }))}
        >
          <TextAlignEnd size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={toolbarBtn(editor.isActive({ textAlign: 'justify' }))}
        >
          <TextAlignJustify size={14} />
        </button>

        <span className="mx-1 h-4 w-px bg-gray-200" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={toolbarBtn(editor.isActive('taskList'))}
        >
          ☑
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={toolbarBtn(false)}
        >
          P
        </button>

        <span className="mx-1 h-4 w-px bg-gray-200" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className={toolbarBtn(false)}
        >
          <RotateCcw size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className={toolbarBtn(false)}
        >
          <RotateCw size={14} />
        </button>
      </div>

      {/* URL input row — only shown when toolbar link/image button is active */}
      {showLinkInput && (
        <div className="flex gap-2 border border-b-0 bg-white px-3 py-2">
          <Input
            type="text"
            value={
              linkUrl.setfor === 'image' ? linkUrl.ImageLink : linkUrl.Link
            }
            onChange={e =>
              setLinkUrl(prev => ({
                ...prev,
                [linkUrl.setfor === 'image' ? 'ImageLink' : 'Link']:
                  e.target.value,
              }))
            }
            placeholder={
              linkUrl.setfor === 'link'
                ? 'https://example.com'
                : 'https://example.com/image.jpg'
            }
            className="h-8 border-none text-sm shadow-none focus:ring-1"
          />
          <BrandButton
            variant="ghost"
            onClick={linkUrl.setfor === 'image' ? addImage : setLink}
          >
            Apply
          </BrandButton>
        </div>
      )}

      <div
        className={[
          'prose max-w-none rounded-b-lg border bg-white px-3 py-2',
          'max-h-56 min-h-68 overflow-y-auto',
          // Make TipTap's inner ProseMirror div behave
          '[&_.ProseMirror]:outline-none',
          '[&_.ProseMirror]:min-h-full',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
        ].join(' ')}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-gray-400 text-xs">
        <span>
          {editor.storage.characterCount.characters()}
          {maxChars ? ` / ${maxChars}` : ''} chars
        </span>
        <div className="flex gap-2">
          <BrandButton
            type="button"
            variant="ghost"
            onClick={() => {
              const clean = DOMPurify.sanitize(editor.getHTML());
              navigator.clipboard?.writeText(clean);
              toast.success('HTML copied!');
            }}
            className="rounded bg-zinc-900 px-2 py-0.5 text-white hover:bg-brand-dark/80 hover:text-white"
          >
            Copy HTML
          </BrandButton>
          <BrandButton
            type="button"
            variant="ghost"
            onClick={() => editor.commands.clearContent()}
            className="flex items-center gap-1 rounded border-none bg-red-50 px-2 py-0.5 text-red-500 hover:bg-red-100"
          >
            <Trash2 size={12} /> Clear
          </BrandButton>
        </div>
      </div>
    </div>
  );
};
