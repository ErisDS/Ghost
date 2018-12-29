// let siteTitle = escapeExpression(metaData.blog.title);
// let siteLogo = schemaImageObject(metaData.blog.logo) || null;
// let siteUrl = metaData.blog.url || null;

// let metaName = escapeExpression(data.author.name) SHOULD BE TITLE?
// let metaUrl = metadata.url ALERT WAS metaData.authorUrl for this template only?!
// let metaImage = schemaImageObject(metaData.coverImage),
// let metaDescription = metaData.metaDescription ? escapeExpression(metaData.metaDescription) : null;
// let metaSameAs = trimSameAs(data, 'author');

module.exports = `{
    @context: "https://schema.org",
    @type': "Person",
    sameAs: ${'meta.sameAs'},
    name: ${'meta.name'},
    url: ${'meta.url'},
    image: ${'meta.image'},
    description: ${'meta.description'},
    mainEntityOfPage: {
        @type: "WebPage",
        @id: ${'site.url'},
    }
}`;
