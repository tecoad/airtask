import { EditorConfig, LexicalNode, ParagraphNode, SerializedElementNode } from 'lexical';

export type SerializedSeedNode = SerializedElementNode;

export class SeedNode extends ParagraphNode {
	static getType() {
		return 'seed';
	}

	static clone(node: SeedNode) {
		return new SeedNode(node.__key);
	}

	createDOM(config: EditorConfig): HTMLElement {
		const dom = super.createDOM(config);

		dom.classList.add(
			'text-white',
			'rounded-sm',
			'inline-block',
			'px-2',
			'py-1',
			'highlight-white/30',
			'bg-gradient-to-tr',
			'from-green-400',
			'to-green-600',
		);

		return dom;
	}

	updateDOM(prevNode: SeedNode, dom: HTMLElement, config: EditorConfig): boolean {
		// Returning false tells Lexical that this node does not need its
		// DOM element replacing with a new copy from createDOM.
		return false;
	}

	static importJSON(serializedNode: SerializedSeedNode): SeedNode {
		const node = $createSeedNode();
		node.setFormat(serializedNode.format);
		node.setIndent(serializedNode.indent);
		node.setDirection(serializedNode.direction);
		return node;
	}

	exportJSON(): SerializedElementNode {
		return {
			...super.exportJSON(),
			type: 'seed',
			version: 1,
		};
	}

	getTextContent(): string {
		const textContent = this.getChildren()
			.map((child: LexicalNode) => child.getTextContent())
			.join('');
		return `~"${textContent}"`;
	}
}

export function $createSeedNode(): ParagraphNode {
	return new SeedNode();
}

export function $isSeedNode(node: LexicalNode | null | undefined): node is SeedNode {
	return node instanceof SeedNode;
}
