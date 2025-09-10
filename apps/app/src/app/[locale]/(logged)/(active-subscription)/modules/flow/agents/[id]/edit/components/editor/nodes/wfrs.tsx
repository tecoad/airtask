import { EditorConfig, LexicalNode, ParagraphNode, SerializedElementNode } from 'lexical';

export type SerializedWfrsNode = SerializedElementNode;

export class WfrsNode extends ParagraphNode {
	static getType() {
		return 'wfrs';
	}

	static clone(node: WfrsNode) {
		return new WfrsNode(node.__key);
	}

	// createDOM(config: EditorConfig) {
	createDOM(config: EditorConfig): HTMLElement {
		const dom = super.createDOM(config);
		dom.classList.add('text-foreground/50', 'text-sm', 'pt-4', 'pb-4');
		dom.contentEditable = 'false';
		return dom;
	}

	// exportDOM(): DOMExportOutput {
	// 	const dom = document.createTextNode('[wfrs');

	// 	return { element: dom };
	// }

	updateDOM(prevNode: WfrsNode, dom: HTMLElement, config: EditorConfig): boolean {
		// Returning false tells Lexical that this node does not need its
		// DOM element replacing with a new copy from createDOM.
		return false;
	}

	static importJSON(serializedNode: SerializedWfrsNode): WfrsNode {
		const node = $createWfrsNode();
		node.setFormat(serializedNode.format);
		node.setIndent(serializedNode.indent);
		node.setDirection(serializedNode.direction);
		return node;
	}

	exportJSON(): SerializedElementNode {
		return {
			...super.exportJSON(),
			type: 'wfrs',
			version: 1,
		};
	}

	// getTextContent(): string {
	// 	return '[wfrs]';
	// }
	getTextContent(): string {
		const textContent = this.getChildren()
			.map((child: LexicalNode) => child.getTextContent())
			.join('');
		return textContent;
	}
}

export function $createWfrsNode(): ParagraphNode {
	return new WfrsNode();
}

export function $isWfrsNode(node: LexicalNode | null | undefined): node is WfrsNode {
	return node instanceof WfrsNode;
}
