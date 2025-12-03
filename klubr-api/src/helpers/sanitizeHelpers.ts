const removeId = (entity: any, bypass = false) => {
    if (!entity || typeof entity !== 'object') {
        return entity;
    }
    const entityWithId = ['avatar', 'federationLink'];
    if (!!entity?.__component) {
        return entity;
    }
    if (!bypass) {
        delete entity.id;
    }
    Object.entries(entity).map(([key, value]) => {
        if (Array.isArray(value) && !!value.length) {
            entity[key] = entity[key].map((val) => removeId(val));
        } else if (typeof value === 'object' && !!value) {
            entity[key] = removeId(entity[key], entityWithId.includes(key));
        }
    });
    return entity;
};

const removeCodes = (entity: any, bypass = false) => {
    if (!entity || typeof entity !== 'object') {
        return entity;
    }
    if (!!entity?.__component) {
        return entity;
    }
    if (!bypass) {
        delete entity.code;
        delete entity.codeLeader;
    }
    Object.entries(entity).map(([key, value]) => {
        if (Array.isArray(value) && !!value.length) {
            entity[key] = entity[key].map((val) => removeCodes(val));
        } else if (typeof value === 'object' && !!value) {
            entity[key] = removeCodes(entity[key]);
        }
    });
    return entity;
};

const removeDocuments = (entity: any, bypass = false) => {
    if (!entity || typeof entity !== 'object') {
        return entity;
    }
    if (!!entity?.__component) {
        return entity;
    }
    if (!bypass) {
        delete entity.klubr_document;
    }
    Object.entries(entity).map(([key, value]) => {
        if (Array.isArray(value) && !!value.length) {
            entity[key] = entity[key].map((val) => removeCodes(val));
        } else if (typeof value === 'object' && !!value) {
            entity[key] = removeCodes(entity[key]);
        }
    });
    return entity;
};

const removeFields = (entity: any, fields = [], bypass = false) => {
    if (!entity || typeof entity !== 'object') {
        return entity;
    }
    if (!!entity?.__component) {
        return entity;
    }
    if (!bypass) {
        fields.map((field) => delete entity[field]);
    }
    Object.entries(entity).map(([key, value]) => {
        if (Array.isArray(value) && !!value.length) {
            entity[key] = entity[key].map((val) => removeFields(val, fields));
        } else if (typeof value === 'object' && !!value) {
            entity[key] = removeFields(entity[key], fields);
        }
    });
    return entity;
};

export { removeId, removeCodes, removeDocuments, removeFields };
