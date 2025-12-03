// const ImageKit = require('imagekit');

// Media Upload Webhook: not implemented
import { Context } from 'koa';

export default {
    async create(ctx: Context) {
        // const imagekitProvider = new ImageKit({
        //   publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        //   privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        //   urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        // });
        //
        // const fileId = ctx.request.body.media?.id;
        // const fileImageKitId = ctx.request.body.media?.provider_metadata.fileId;
        //
        // // if (ctx.request.body.event.startsWith('media')) {
        // //   console.log('           >>>> Media event', ctx.request.body.event);
        // // }
        console.log('           >>>> event', ctx.request['body'].event);

        // if (ctx.request.body.event === "media.update") {
        //   console.log('           >>>> Media updated');
        //   // imagekitProvider.getFileDetails(fileImageKitId, function(error, result) {
        //   //   if(error) console.log(error);
        //   //   else console.log('imageKit file', result);
        //   // });
        //   // const media = await strapi.entityService.findOne("plugin::upload.file", fileId);
        //
        //
        // } else if(ctx.request.body.event === "media.create") {
        //   console.log('           >>>> Media created');
        //
        // }

        // return ctx.send({ message: "Emails sent successfully!" });
        return ctx.send(true);
    },
};
