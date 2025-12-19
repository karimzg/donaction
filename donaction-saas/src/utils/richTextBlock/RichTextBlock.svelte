<script lang="ts">
  import { onMount } from 'svelte';

  // Define the interfaces as TypeScript types
  export type RichTextBlockText = {
    type: 'text';
    text: string;
    underline?: boolean;
    strikethrough?: boolean;
    italic?: boolean;
    bold?: boolean;
    code?: boolean;
  };

  export type RichTextBlockParagraph = {
    type: 'paragraph';
    children: Array<RichTextBlockText>;
  };

  export type RichTextBlockHeading = {
    type: 'heading';
    level: number;
    children: Array<RichTextBlockText>;
  };

  export type RichTextBlockList = {
    type: 'list';
    format?: 'unordered';
    children: Array<RichTextBlockListItem>;
  };

  export type RichTextBlockListItem = {
    type: 'list-item';
    children: Array<RichTextBlockText>;
  };

  export type RichTextBlockLink = {
    type: 'link';
    url: string;
    children: Array<RichTextBlockText>;
  };

  export type RichTextBlockEl =
    | RichTextBlockHeading
    | RichTextBlockParagraph
    | RichTextBlockList
    | RichTextBlockListItem
    | RichTextBlockLink
    | RichTextBlockText;

  export let data: Array<RichTextBlockEl>;
  export let classCss: string = '';

  // Function to render text based on the formatting properties
  const renderText = (textData: RichTextBlockText) => {
    const { text, underline, strikethrough, italic, bold, code } = textData;

    let cssClass = '';
    if (underline) cssClass += ' underline';
    if (strikethrough) cssClass += ' line-through';
    if (italic) cssClass += ' italic';
    if (bold) cssClass += ' font-bold';

    return code
      ? `<code class="${cssClass.trim()}">${text}</code>`
      : `<span class="${cssClass.trim()}">${text}</span>`;
  };

  // Function to render children elements recursively
  const renderChildren = (children: Array<RichTextBlockEl>) => {
    return children
      .map((child) => {
        if (child.type === 'text') {
          return renderText(child as RichTextBlockText);
        } else {
          return renderBlock(child);
        }
      })
      .join('');
  };

  // Function to render each block based on its type
  const renderBlock = (block: RichTextBlockEl) => {
    switch (block.type) {
      case 'heading':
        return `<h${(block as RichTextBlockHeading).level}>${renderChildren(block.children)}</h${(block as RichTextBlockHeading).level}>`;
      case 'paragraph':
        return `<p class="m-0">${renderChildren(block.children)}</p>`;
      case 'list':
        const ListTag = (block as RichTextBlockList).format === 'unordered' ? 'ul' : 'ol';
        return `<${ListTag}>${renderChildren(block.children)}</${ListTag}>`;
      case 'list-item':
        return `<li>${renderChildren(block.children)}</li>`;
      case 'link':
        return `<a href="${(block as RichTextBlockLink).url}">${renderChildren(block.children)}</a>`;
      default:
        return '';
    }
  };

  // Generate the rendered HTML content
  let renderedContent = '';

  onMount(() => {
    renderedContent = data.map((block) => renderBlock(block)).join('');
  });
</script>

<section class={`${classCss} applyRichTextStyles`}>
  {@html renderedContent}
</section>

<style lang="scss">
  @use '../../styles/main';
  @use 'index';
  .applyRichTextStyles {
    p {
      margin: 0 !important;
    }
  }
</style>
