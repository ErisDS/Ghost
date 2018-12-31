/**
 * Post Schema = Article
 */

// All my template variables
// let siteTitle = escapeExpression(metaData.blog.title);
// let siteLogo = schemaImageObject(metaData.blog.logo) || null;
// let siteUrl = metaData.blog.url || null;
// let authorName = escapeExpression(data.post.primary_author.name);
// let authorImage = schemaImageObject(metaData.authorImage);
// let authorSameAs = trimSameAs(data, "post");
// let authorDescription = data.post.primary_author.metaDescription ? escapeExpression(data.post.primary_author.metaDescription) : null
// let metaTitle = escapeExpression(metaData.metaTitle)
// let metaUrl = metadata.url
// let metaDatePublished = metaData.publishedDate
// let metaDateModified = metaData.modifiedDate
// let metaImage = schemaImageObject(metaData.coverImage);
// let metaKeywords = metaData.keywords && metaData.keywords.length > 0 ? metaData.keywords.join(", ") : null;
// let metaDescription = metaData.excerpt ? escapeExpression(metaData.excerpt) : null;

module.exports = `{
    @context: "https://schema.org",
    @type: "Article",
    publisher: {
        @type: "Organization",
        name: "{{site.title}}",
        logo: {{site.logo}}
    },
    author: {
        "@type": "Person",
        name: "{{author.name}}",
        image: {{author.image}},
        url: "{{author.url}}",
        sameAs: "{{author.sameAs}}",
        description: "{{author.description}}"
    },
    headline: "{{meta.title}}",
    url: "{{meta.url}}",
    datePublished: "{{meta.datePublished}}",
    dateModified: "{{meta.dateModified}}",
    image: {{meta.image}},
    keywords: "{{meta.keywords}}",
    description: "{{meta.description}}",
    mainEntityOfPage: {
        @type: "WebPage",
        @id: {{site.url}},
    }
}`;
