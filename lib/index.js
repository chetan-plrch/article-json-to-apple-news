import assert from 'assert';
import renderBlockList from './block-list';
import objectAssign from 'object-assign';
import defaultStyles from './default-styles';
import bundleImages from './bundle-images';
import renderHeader from './header';
import formatDate from './format-date';
import packageJson from '../package.json';

function convertToAppleNews (articleJson, opts) {
  assert(opts, 'opts required');
  assert(opts.identifier, 'opts.identifier required');
  assert(articleJson, 'articleJson required');
  assert(articleJson.title, 'articleJson.title required');
  assert(Array.isArray(articleJson.body), 'articleJson.body required to be an array');

  const header = renderHeader(articleJson, opts);
  const components = renderBlockList(articleJson, opts);
  components.unshift(header);

  const bundlesToUrls = bundleImages(components);
  const article = {
    version: '1.0',
    identifier: opts.identifier,
    title: articleJson.title,
    language: articleJson.language || 'en',
    metadata: {
      generatorName: 'article-json-to-apple-news',
      generatorVersion: packageJson.version
    },
    documentStyle: opts.documentStyle,
    layout: objectAssign({}, defaultStyles.layout, opts.layout),
    componentLayouts: objectAssign({}, defaultStyles.componentLayouts, opts.componentLayouts),
    componentTextStyles: objectAssign({}, defaultStyles.componentTextStyles, opts.componentTextStyles),
    componentStyles: objectAssign({}, defaultStyles.componentStyles, opts.componentStyles),
    textStyles: objectAssign({}, defaultStyles.textStyles, opts.textStyles),
    components
  };

  if (articleJson.author && articleJson.author.name) {
    article.metadata.authors = [articleJson.author.name];
  }

  if (articleJson.headerEmbed && articleJson.headerEmbed.type === 'embed' &&
      articleJson.headerEmbed.embedType === 'image') {
    Object.keys(bundlesToUrls).forEach(function (key) {
      const value = bundlesToUrls[key];
      if (value === articleJson.headerEmbed.src) {
        article.metadata.thumbnailURL = 'bundle://' + key;
      }
    });
  }

  if (articleJson.modifiedDate) {
    article.metadata.dateModified = formatDate(articleJson.modifiedDate);
  }

  if (articleJson.publishedDate) {
    const published = formatDate(articleJson.publishedDate);
    article.metadata.datePublished = published;
    article.metadata.dateCreated = published;
  }

  if (opts.excerpt) {
    article.metadata.excerpt = String(opts.excerpt);
  }

  if (opts.canonicalURL) {
    article.metadata.canonicalURL = String(opts.canonicalURL);
  }

  if (opts.campaignData) {
    article.metadata.campaignData = opts.campaignData;
  }

  if (opts.keywords) {
    article.metadata.keywords = opts.keywords;
  }

  return {article, bundlesToUrls};
}

module.exports = convertToAppleNews;
