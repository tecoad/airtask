import { InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
// import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
// import { TRANSFORMERS } from '@lexical/markdown';
// import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';

import { ENV } from '@/core/config/env';
import { $getRoot, LexicalNode, ParagraphNode } from 'lexical';
import {
	BeautifulMentionNode,
	BeautifulMentionsPlugin,
	ZeroWidthNode,
} from 'lexical-beautiful-mentions';
import { CustomParagraphNode } from './nodes/custom-paragraph';
import { CustomTextNode } from './nodes/custom-text';
import {
	Menu,
	MenuItem,
	beautifulMentionsTheme,
	mentionItems,
} from './nodes/mention-component';
// import { CustomMentionsNode } from './nodes/mention-node';
import { FlowAgentFragment } from '@/core/shared/gql-api-schema';
import { FlowAgentFormValues } from '@/lib/flow-agent/hooks';
import { useTranslations } from 'next-intl';
import { useController, useFormContext } from 'react-hook-form';
import { EditorRulesPlugin } from './editor-rules-plugin';
import { CustomMentionsNode } from './nodes/custom-mentions-node';
import { ParagraphPlaceholderPlugin } from './nodes/paragraph-placeholder';
import { SeedNode } from './nodes/seed';
import { WfrsNode } from './nodes/wfrs';
import TreeViewPlugin from './tree-view-plugin';

function onError(error: Error): void {
	console.error(error);
}

const Editor = ({ data }: { data: FlowAgentFragment }) => {
	const t = useTranslations('flow.agents.editor');

	const initialConfig: InitialConfigType = {
		namespace: 'Editor',
		theme: {
			beautifulMentions: beautifulMentionsTheme,
		},

		editorState: data.script_schema ? data.script_schema : null,

		// ...(data.script_schema ? { editorState: data.script_schema } : {}),
		onError,
		nodes: [
			CustomMentionsNode,
			{
				replace: BeautifulMentionNode,
				with: (node: BeautifulMentionNode) => {
					return new CustomMentionsNode(
						node.getTrigger(),
						node.getValue(),
						node.getData(),
					);
				},
			},
			WfrsNode,
			SeedNode,
			ZeroWidthNode,
			CustomParagraphNode,
			CustomTextNode,
			{
				replace: ParagraphNode,
				with: (node: ParagraphNode) => {
					return new CustomParagraphNode();
				},
			},
		],
	};

	const { control, watch } = useFormContext<FlowAgentFormValues>();

	function getCustomTextContent(root: LexicalNode) {
		return root
			.getChildren()
			.map((child: LexicalNode) => child.getTextContent())
			.join('\n\n');
	}

	const scriptField = useController({
			control,
			name: 'script',
		}),
		scriptSchemaField = useController({
			control,
			name: 'script_schema',
		});

	return (
		<LexicalComposer initialConfig={initialConfig}>
			<RichTextPlugin
				contentEditable={<ContentEditable className="editor" />}
				placeholder={<></>}
				ErrorBoundary={LexicalErrorBoundary}
			/>

			<ParagraphPlaceholderPlugin
				placeholder={t('newLinePlaceholder')}
				hideOnEmptyEditor
			/>

			<BeautifulMentionsPlugin
				items={mentionItems}
				menuComponent={Menu}
				menuItemComponent={MenuItem}
			/>

			<EditorRulesPlugin />
			<HistoryPlugin />

			<OnChangePlugin
				ignoreSelectionChange
				onChange={(editorState) => {
					// const textContent = editorState.read(() => $getRoot().getTextContent());
					const customTextContent = editorState.read(() =>
						getCustomTextContent($getRoot()),
					);

					scriptField.field.onChange(customTextContent);
					scriptSchemaField.field.onChange(JSON.stringify(editorState.toJSON()));
				}}
			/>

			{ENV.isLocal ? <TreeViewPlugin /> : <></>}
		</LexicalComposer>
	);
};

export default Editor;
