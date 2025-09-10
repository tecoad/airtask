import {
	$applyNodeReplacement,
	DOMExportOutput,
	LexicalEditor,
	LexicalNode,
	ParagraphNode,
	SerializedElementNode,
} from 'lexical';

export type SerializedCustomParagraphNode = SerializedElementNode;

export class CustomParagraphNode extends ParagraphNode {
	static getType(): string {
		return 'custom-paragraph';
	}

	static clone(node: CustomParagraphNode): CustomParagraphNode {
		return new CustomParagraphNode(node.__key);
	}

	exportDOM(editor: LexicalEditor): DOMExportOutput {
		const { element } = super.exportDOM(editor);

		return { element };
	}

	// exportDOM(editor: LexicalEditor): DOMExportOutput {
	// 	const element = document.createElement('pre');
	// 	element.setAttribute('spellcheck', 'false');

	// 	return { element };
	// }

	exportJSON(): SerializedElementNode {
		const node = super.exportJSON();
		node.type = 'custom-paragraph';
		return node;
	}

	getTextContent(): string {
		const textContent = this.getChildren()
			.map((child: LexicalNode) => child.getTextContent())
			.join('');
		return `~"${textContent}"`;
	}

	static importJSON(node: SerializedCustomParagraphNode): CustomParagraphNode {
		return super.importJSON(node);
	}
}

export function $createCustomParagraphNode(): CustomParagraphNode {
	return $applyNodeReplacement(new CustomParagraphNode());
}

export function $isCustomParagraphNode(
	node: LexicalNode | null | undefined,
): node is CustomParagraphNode {
	return node instanceof CustomParagraphNode;
}
