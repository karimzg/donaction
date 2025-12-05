import React from 'react';
import Link from 'next/link';

interface RichTextBlockProps {
	data: Array<RichTextBlockEl>;
	classCss?: string;
}

interface RichTextBlockParagraph {
	type: 'paragraph';
	children: Array<RichTextBlockText>;
}
interface RichTextBlockHeading {
	type: 'heading';
	level: number;
	children: Array<RichTextBlockText>;
}
interface RichTextBlockList {
	type: 'list';
	format?: 'unordered';
	children: Array<RichTextBlockListItem>;
}
interface RichTextBlockListItem {
	type: 'list-item';
	children: Array<RichTextBlockText>;
}
interface RichTextBlockLink {
	type: 'link';
	url: string;
	children: Array<RichTextBlockText>;
}
interface RichTextBlockText {
	type: 'text';
	text: string;
	underline?: boolean;
	strikethrough?: boolean;
	italic?: boolean;
	bold?: boolean;
	code?: boolean;
}
export type RichTextBlockEl =
	| RichTextBlockHeading
	| RichTextBlockParagraph
	| RichTextBlockList
	| RichTextBlockListItem
	| RichTextBlockLink
	| RichTextBlockText;

const renderText = (textData: RichTextBlockText) => {
	const { text, underline, strikethrough, italic, bold, code } = textData;

	let cssClass = '';

	if (underline) {
		cssClass += ' underline';
	}

	if (strikethrough) {
		cssClass += ' line-through';
	}

	if (italic) {
		cssClass += ' italic';
	}

	if (bold) {
		cssClass += ' font-bold';
	}

	return code ? <code className={cssClass}>{text}</code> : <span className={cssClass}>{text}</span>;
};

const renderChildren = (children: Array<RichTextBlockEl>) => {
	return children.map((child, index) =>
		child.type === 'text' ? (
			<React.Fragment key={index}>{renderText(child)}</React.Fragment>
		) : (
			<React.Fragment key={index}>{renderBlock(child)}</React.Fragment>
		),
	);
};

const renderBlock = (block: RichTextBlockEl) => {
	switch (block.type) {
		case 'heading':
			return React.createElement(`h${block.level}`, null, renderChildren(block.children));
		case 'paragraph':
			return <p>{renderChildren(block.children)}</p>;
		case 'list':
			const ListTag = block.format === 'unordered' ? 'ul' : 'ol';
			return React.createElement(ListTag, null, renderChildren(block.children));
		case 'list-item':
			return <li>{renderChildren(block.children)}</li>;
		case 'link':
			return <Link href={block.url}>{renderChildren(block.children)}</Link>;
		default:
			return null;
	}
};

const RichTextBlock: React.FC<RichTextBlockProps> = ({ data, classCss }: RichTextBlockProps) => {
	return (
		<section className={`${classCss} applyRichTextStyles`}>
			{data.map((block, index) => (
				<React.Fragment key={index}>{renderBlock(block)}</React.Fragment>
			))}
		</section>
	);
};

export default RichTextBlock;
