import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TransformationService {

  public transformDataToEditorFormat(data: any): any {
    return {
      type: 'doc',
      content: data.map((item: any) => {
        if (item.type === 'heading') {
          return {
            type: 'heading',
            attrs: { level: item.level || 1 },
            content: item.children.map((child: any) => ({
              type: 'text',
              text: child.text,
              marks: [
                ...(child.bold ? [{ type: 'strong' }] : []),
                ...(child.italic ? [{ type: 'em' }] : []),
                ...(child.underline ? [{ type: 'u' }] : []),
                ...(child.strikethrough ? [{ type: 's' }] : []),
              ],
            })).filter((node: any) => node.text.trim() !== ''), // Filter out empty text nodes
          };
        } else if (item.type === 'paragraph') {
          return {
            type: 'paragraph',
            attrs: { align: item.align || null, indent: item.indent || null },
            content: item.children.map((child: any) => {
              if (child.type === 'text') {
                return {
                  type: 'text',
                  text: child.text,
                  marks: [
                    ...(child.bold ? [{ type: 'strong' }] : []),
                    ...(child.italic ? [{ type: 'em' }] : []),
                    ...(child.underline ? [{ type: 'u' }] : []),
                    ...(child.strikethrough ? [{ type: 's' }] : []),
                    ...(child.code ? [{ type: 'code' }] : []),
                  ],
                };
              } else if (child.type === 'link') {
                return {
                  type: 'text',
                  text: child.children[0].text,
                  marks: [
                    {
                      type: 'link',
                      attrs: {
                        href: child.url,
                        title: child.children[0].text,
                        target: child.target || '_blank',
                      },
                    },
                  ],
                };
              }
              return {};
            }).filter((node: any) => node.text && node.text.trim() !== ''), // Filter out empty text nodes
          };
        } else if (item.type === 'list') {
          return {
            type: item.format === 'ordered' ? 'ordered_list' : 'bullet_list',
            content: item.children.map((listItem: any) => ({
              type: 'list_item',
              content: [{
                type: 'paragraph',
                content: listItem.children.map((listItemChild: any) => ({
                  type: 'text',
                  text: listItemChild.text,
                  marks: [
                    ...(listItemChild.bold ? [{ type: 'strong' }] : []),
                    ...(listItemChild.italic ? [{ type: 'em' }] : []),
                    ...(listItemChild.underline ? [{ type: 'u' }] : []),
                    ...(listItemChild.strikethrough ? [{ type: 's' }] : []),
                  ],
                })),
              }],
            })),
          };
        } else if (item.type === 'quote') {
          return {
            type: 'blockquote',
            content: item.children.map((quoteChild: any) => ({
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: quoteChild.text,
                  marks: [
                    ...(quoteChild.bold ? [{ type: 'strong' }] : []),
                    ...(quoteChild.italic ? [{ type: 'em' }] : []),
                    ...(quoteChild.underline ? [{ type: 'u' }] : []),
                    ...(quoteChild.strikethrough ? [{ type: 's' }] : []),
                    ...(quoteChild.code ? [{ type: 'code' }] : []),
                  ],
                },
              ],
            })),
          };
        }
        return {};
      }).filter((node: any) => Object.keys(node).length > 0), // Filter out empty nodes
    };
  }

  private handleTextTransform(childNodes: NodeListOf<ChildNode>): any {
    const arrayChildNodes = Array.from(childNodes);
    if (arrayChildNodes.length === 0) {
      return [{
        type: 'text',
        text: '',
      }];
    }
    return arrayChildNodes.map(child => {
      if (child.nodeName === '#text') {
        return {
          type: 'text',
          text: child.textContent,
        };
      } else if (child.nodeName === 'STRONG') {
        return {
          type: 'text',
          text: child.textContent,
          bold: true,
        };
      } else if (child.nodeName === 'EM') {
        return {
          type: 'text',
          text: child.textContent,
          italic: true,
          bold: Array.from(child.childNodes).some(grandChild => grandChild.nodeName === 'STRONG'),
        };
      } else if (child.nodeName === 'A') {
        const element = child as Element;
        return {
          type: 'link',
          text: undefined,
          url: element.getAttribute('href'),
          children: [{ type: 'text', text: element.textContent }],
        };
      }
      return {};
    }).filter(child => (child.text?.trim() !== '') || child.type === 'link');
  }


  private recursiveNodeTransform(childNodes: NodeListOf<ChildNode>): any {

    return Array.from(childNodes).map(node => {
      if (node.nodeName === 'P') {
        return {
          type: 'paragraph',
          children: this.handleTextTransform(node.childNodes),
        };
      } else if (node.nodeName.startsWith('H')) {
        return {
          type: 'heading',
          level: +node.nodeName[1],
          children: this.handleTextTransform(node.childNodes),
        };
      } else if (node.nodeName === 'BLOCKQUOTE') {
        return (node.childNodes.length === 1 && node.childNodes[0].nodeName === 'P') ? {
          type: 'quote',
          children: this.handleTextTransform(node.childNodes[0].childNodes),
        } : {};
      } else if (node.nodeName === 'UL' || node.nodeName === 'OL') {
        return {
          type: 'list',
          format: node.nodeName === 'OL' ? 'ordered' : 'unordered',
          children: this.recursiveNodeTransform(node.childNodes),
        };
      } else if (node.nodeName === 'LI') {
        return (node.childNodes.length === 1 && node.childNodes[0].nodeName === 'P') ?
          {
            type: 'list-item',
            children: this.handleTextTransform(node.childNodes[0].childNodes),
          } : {};
      }
      return {};
    }).filter(node => node.type);
  }

  public transformEditorToApiFormat(editorData: any): any {
    const parser = new DOMParser();
    const doc = parser.parseFromString(editorData, 'text/html');
    return this.recursiveNodeTransform(doc.body.childNodes);
  }
}
