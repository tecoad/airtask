import {
	EditorConfig,
	LexicalNode,
	NodeKey,
	SerializedTextNode,
	TextNode,
} from 'lexical';

export class CustomTextNode extends TextNode {
	__renderedText: string;
	__savedText: string;
	__editable: boolean;

	constructor(
		renderedText: string,
		savedText: string,
		editable: boolean = true,
		key?: NodeKey,
	) {
		super(renderedText, key);
		this.__renderedText = renderedText;
		this.__savedText = savedText;
		this.__editable = editable;
	}

	static getType(): string {
		return 'custom-text';
	}

	static clone(node: CustomTextNode): CustomTextNode {
		return new CustomTextNode(
			node.__renderedText,
			node.__savedText,
			node.__editable,
			node.__key,
		);
	}

	getTextContent(): string {
		return this.__savedText;
	}

	createDOM(config: EditorConfig): HTMLElement {
		const element = super.createDOM(config);
		element.contentEditable = this.__editable ? 'true' : 'false';
		element.style.userSelect = this.__editable ? 'auto' : 'none';
		return element;
	}

	updateDOM(prevNode: CustomTextNode, dom: HTMLElement, config: EditorConfig): boolean {
		const isUpdated = super.updateDOM(prevNode, dom, config);
		if (prevNode.__editable !== this.__editable) {
			dom.contentEditable = this.__editable ? 'true' : 'false';
		}
		return isUpdated;
	}

	exportJSON(): SerializedTextNode {
		return {
			...super.exportJSON(),
			type: 'custom-text',
			version: 1,
		};
	}
}

export function $createCustomTextNode(
	renderedText: string,
	savedText: string,
	editable: boolean = true,
): CustomTextNode {
	return new CustomTextNode(renderedText, savedText, editable);
}

export function $isCustomTextNode(
	node: LexicalNode | null | undefined,
): node is CustomTextNode {
	return node instanceof CustomTextNode;
}
