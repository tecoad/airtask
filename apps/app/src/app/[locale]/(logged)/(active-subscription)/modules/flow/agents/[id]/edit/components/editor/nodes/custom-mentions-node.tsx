import { LexicalEditor } from 'lexical';
import {
	BeautifulMentionComponentProps,
	BeautifulMentionNode,
	SerializedBeautifulMentionNode,
} from 'lexical-beautiful-mentions';
import { EditorConfig } from 'lexical/LexicalEditor';
import React, { ElementType } from 'react';
import { CustomMentionComponent } from './mention-component';

export class CustomMentionsNode extends BeautifulMentionNode {
	static getType() {
		return 'custom-beautifulMention';
	}
	static clone(node: CustomMentionsNode) {
		return new CustomMentionsNode(node.__trigger, node.__value, node.__data, node.__key);
	}
	static importJSON(serializedNode: SerializedBeautifulMentionNode) {
		return new CustomMentionsNode(
			serializedNode.trigger,
			serializedNode.value,
			serializedNode.data,
		);
	}
	exportJSON(): SerializedBeautifulMentionNode {
		const data = this.__data;
		return {
			trigger: this.__trigger,
			value: this.__value,
			...(data ? { data } : {}),
			type: 'custom-beautifulMention',
			version: 1,
		};
	}

	getTextContent(): string {
		return this.__value;
	}

	component(): ElementType<BeautifulMentionComponentProps> | null {
		return CustomMentionComponent;
	}
	decorate(editor: LexicalEditor, config: EditorConfig): React.JSX.Element {
		return super.decorate(editor, config);
	}
}
