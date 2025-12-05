import {UID} from "@strapi/strapi";
import {merge, isEmpty} from "lodash/fp"

function getModelPopulationAttributes(model: any): [key: string, value: any][] {
  if (model.uid === "plugin::upload.file") {
    const { related, ...attributes } = model.attributes;
    return Object.entries(
        attributes
    )
  }

  return Object.entries(
      model.attributes
  );
};

export default function getFullPopulateObject(modelUid: UID.Schema, maxDepth = 20, parentModelUid: any = null) {
  if (maxDepth <= 1) {
    return true;
  }
  if (modelUid === "admin::user") {
    return undefined;
  }

  const populate = {};
  const model = strapi.getModel(modelUid);
  for (const [key, value] of getModelPopulationAttributes(model)) {
    if (value) {
      if (value.type === "relation" && value.target === parentModelUid) {
        continue;
      }
      if (value.type === "component") {
        populate[key] = getFullPopulateObject(value.component, maxDepth - 1);
      } else if (value.type === "dynamiczone") {
        const dynamicPopulate = value.components.reduce((prev, cur) => {
          const curPopulate = getFullPopulateObject(cur, maxDepth - 1);
          return curPopulate === true ? prev : merge(prev, curPopulate);
        }, {});
        populate[key] = isEmpty(dynamicPopulate) ? true : dynamicPopulate;
      } else if (value.type === "relation") {
        const relationPopulate = getFullPopulateObject(
          value.target,
          1,
          modelUid // Pass the current model as parent
        );
        if (relationPopulate) {
          populate[key] = relationPopulate;
        }


      } else if (value.type === "media") {
        populate[key] = true;
      }
    }
  }
  return isEmpty(populate) ? true : { populate };
};

