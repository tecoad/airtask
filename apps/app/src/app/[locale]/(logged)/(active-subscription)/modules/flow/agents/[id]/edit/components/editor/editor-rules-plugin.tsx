import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import {
	$createTextNode,
	$getRoot,
	$getSelection,
	$isRangeSelection,
	RootNode,
} from 'lexical';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { $isCustomParagraphNode, CustomParagraphNode } from './nodes/custom-paragraph';
import { $createCustomTextNode } from './nodes/custom-text';
import { $createSeedNode, $isSeedNode, SeedNode } from './nodes/seed';
import { $createWfrsNode, $isWfrsNode, WfrsNode } from './nodes/wfrs';

export function EditorRulesPlugin(): null {
	const [editor] = useLexicalComposerContext();

	const t = useTranslations('flow.agents.editor');

	const defaultSeedText = t('defaultSeedText');

	const wfrsValue = '*Wait For Prospect To Respond*';

	const createWfrs = () => {
		const wfrsNode = $createWfrsNode();
		const textNode = $createCustomTextNode(t('waitForResponse'), wfrsValue, false);
		wfrsNode.append(textNode);

		return wfrsNode;
	};

	useEffect(() => {
		const unSubscribers: (() => void)[] = [];

		// adding wfrs if there is no wfrs node before a new paragraph
		unSubscribers.push(
			editor.registerNodeTransform(CustomParagraphNode, (paragraph) => {
				const previousNode = paragraph.getPreviousSibling();
				if (previousNode && !$isWfrsNode(previousNode)) {
					// repeats
					const wfrsNode = createWfrs();
					//
					paragraph.insertBefore(wfrsNode);
				}
			}),
		);

		// restoring seed text content
		unSubscribers.push(
			editor.registerNodeTransform(SeedNode, (seed) => {
				if (seed.isEmpty()) {
					const textNode = $createTextNode(defaultSeedText);
					seed.append(textNode);
					// moving the cursor to the end
					textNode.select();
				}
			}),
		);

		unSubscribers.push(
			editor.registerNodeTransform(RootNode, (root) => {
				// last node cannot be wfrs
				const lastChild = root.getLastChild();

				if ($isWfrsNode(lastChild)) {
					lastChild.remove();
				}

				// first node must be seed
				const firstChild = root.getFirstChild();

				if (firstChild && !$isSeedNode(firstChild)) {
					const seedNode = $createSeedNode();
					seedNode.append($createTextNode(defaultSeedText));
					firstChild.insertBefore(seedNode);
				}
			}),
		);

		// check if there is any empty paragraph which is not selected and remove it
		unSubscribers.push(
			editor.registerUpdateListener(({ editorState }) => {
				// const textContent = editorState.read(() => $getRoot().getTextContent());

				editor.update(() => {
					const root = $getRoot();
					const emptyParagraphs = root
						.getChildren()
						.filter((node) => $isCustomParagraphNode(node) && node.isEmpty());

					const selection = $getSelection();
					if (!selection || !$isRangeSelection(selection)) return;

					const selectedNode = selection.anchor.getNode();

					for (const paragraph of emptyParagraphs) {
						if (paragraph !== selectedNode) {
							paragraph.remove();
						}
					}
				});
			}),
		);

		// prevent two consecutive wfrs nodes
		unSubscribers.push(
			editor.registerNodeTransform(WfrsNode, (wfrs) => {
				const lastNode = wfrs.getPreviousSibling();
				const nextNode = wfrs.getNextSibling();

				if ($isWfrsNode(lastNode) || $isWfrsNode(nextNode)) {
					wfrs.remove();
				}
			}),
		);

		// detect wfrsValue and replace it with a wfrs node
		// unSubscribers.push(
		// 	editor.registerNodeTransform(TextNode, (textNode) => {
		// 		const text = textNode.getTextContent();
		// 		if (!text.includes(wfrsValue)) return;

		// 		const parts = text.split(wfrsValue);

		// 		const parent = textNode.getParent();

		// 		parts.forEach((part, index) => {
		// 			const newText = $createTextNode(part.trim());
		// 			const newParagraph = $createCustomParagraphNode();
		// 			newParagraph.append(newText);
		// 			parent.insertBefore(newParagraph);

		// 			const wfrsNode = createWfrs();
		// 			parent.insertAfter(wfrsNode);
		// 		});

		// 		parent.remove();
		// 	}),
		// );

		return () => {
			unSubscribers.forEach((v) => v());
		};
	}, [editor]);

	return null;
}
