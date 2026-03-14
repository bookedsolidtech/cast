import { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Markdown as MarkdownExt } from 'tiptap-markdown';
import type { Editor } from '@tiptap/react';

interface DocsEditorProps {
  /** Markdown content to load */
  content: string;
  /** Called with markdown string on every edit (debounce in parent) */
  onUpdate: (markdown: string) => void;
  /** Called when editor instance is ready */
  onEditorReady?: (editor: Editor) => void;
}

export function DocsEditor({ content, onUpdate, onEditorReady }: DocsEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline' },
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      MarkdownExt,
    ],
    content,
    onUpdate: ({ editor: e }) => {
      onUpdate(e.storage.markdown.getMarkdown());
    },
    editorProps: {
      attributes: {
        class: 'min-h-full px-6 py-4 focus:outline-none',
      },
    },
  });

  const handleReady = useCallback(
    (e: Editor) => {
      onEditorReady?.(e);
    },
    [onEditorReady]
  );

  useEffect(() => {
    if (editor) handleReady(editor);
  }, [editor, handleReady]);

  // Sync content when file changes (different file selected)
  useEffect(() => {
    if (!editor) return;
    const currentMd = editor.storage.markdown.getMarkdown();
    if (content !== currentMd) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  return (
    <div className="flex-1 overflow-y-auto">
      <EditorContent editor={editor} className="h-full docs-editor" />
    </div>
  );
}
