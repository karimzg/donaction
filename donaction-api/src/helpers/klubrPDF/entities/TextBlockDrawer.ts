import TextDrawer from "./TextDrawer";

export default class TextBlockDrawer {
  textBlock: Array<TextDrawer>;
  config: {
    x: number;
    y: number;
    isRtl: boolean;
    extraLineHeight?: number
  };

  constructor(textBlock: Array<TextDrawer>, conf: {
    x: number;
    y: number;
    isRtl: boolean;
    extraLineHeight?: number
  }) {
    this.textBlock = textBlock;
    this.config = conf;
  }

  getDrawableText(index: number) {
    if (!this.textBlock[index]) {
      return;
    }
    const calculateAdditionalY = (index: number) => {
      return this.textBlock.slice(0, index).reduce((acc, curr) => {
        return (
          acc +
          curr.data.font.heightAtSize(curr.data.size) +
          (this.config?.extraLineHeight || 0)
        );
      }, 0);
    };
    const {
      data: { text, font, size },
    } = this.textBlock[index];
    return new TextDrawer({
      ...this.textBlock[index].data,
      x: this.config.isRtl
        ? this.config.x - font.widthOfTextAtSize(text, size)
        : this.config.x,
      y: this.config.y - calculateAdditionalY(index),
    });
  }
}