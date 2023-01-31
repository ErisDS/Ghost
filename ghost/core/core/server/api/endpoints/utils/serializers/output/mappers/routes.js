module.exports = (model) => {
    const json = model.toJSON();

    return {
        id: json.id,
        path: json.path
    };
};
