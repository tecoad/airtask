import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { TreeView } from '@lexical/react/LexicalTreeView';

export default function TreeViewPlugin(): JSX.Element {
	const [editor] = useLexicalComposerContext();
	return (
		<div className="relative h-[500px] w-full overflow-hidden">
			<TreeView
				viewClassName="bg-background/50 text-foreground/70 rounded-sm border p-3 text-xs absolute inset-0 overflow-scroll"
				treeTypeButtonClassName="bg-yellow-500 highlight-white/30 rounded-sm text-white px-2 py-1 absolute right-[10px] top-[10px]"
				timeTravelButtonClassName="bg-foreground rounded-sm text-background px-2 py-1 absolute right-[10px] bottom-[10px]"
				timeTravelPanelClassName="bg-foreground absolute right-[10px] bottom-[10px] rounded-sm text-background px-3 py-2 flex flex-row items-center gap-2"
				timeTravelPanelSliderClassName=""
				timeTravelPanelButtonClassName="bg-background/70 highlight-white/30 text-foreground px-2 py-1 rounded-full text-white"
				editor={editor}
			/>
		</div>
	);
}
