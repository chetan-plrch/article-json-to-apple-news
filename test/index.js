import test from 'ava';
import 'babel-core/register';
import toAppleNews from '../lib';
import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';

test('apple news format', t => {
  const data = [
    { type: 'header1', children: [{ type: 'text', content: 'header 1 text' }] },
    { type: 'header2', children: [{ type: 'text', content: 'header 2 text' }] },
    { type: 'header3', children: [{ type: 'text', content: 'header 3 text' }] },
    { type: 'header4', children: [{ type: 'text', content: 'header 4 text' }] },
    { type: 'header5', children: [{ type: 'text', content: 'header 5 text' }] },
    { type: 'header6', children: [{ type: 'text', content: 'header 6 text' }] },
    { type: 'paragraph',
      children: [
        { type: 'text', href: 'http://mic.com', content: 'link' },
        { type: 'linebreak' },
        { type: 'text', content: 'normal text ' },
        { type: 'text', bold: true, content: 'bold text ' },
        { type: 'text', italic: true, content: 'italic text ' },
        { type: 'text', bold: true, italic: true, content: 'bold italic text ' },
        { type: 'text', mark: true, content: 'marked text' },
        { type: 'text', mark: true, markClass: 'marker1' }
      ]
    },
    { type: 'paragraph',
      children: [
        { type: 'text', content: 'other text' }
      ]
    },
    { type: 'paragraph', children: [{ type: 'text', mark: true }] }
  ];

  const apn = toAppleNews(data, { identifier: '100', title: 'Article Title' });
  t.is(apn.version, '1.0');
  t.is(apn.identifier, '100');
  t.is(apn.title, 'Article Title');

  const expected = {
    componentTextStyles: {
      bodyStyle: {
        fontName: 'HelveticaNeue',
        fontSize: 18
      },
      heading1Style: {
        fontName: 'HelveticaNeue-Bold',
        fontSize: 32
      },
      heading2Style: {
        fontName: 'HelveticaNeue-Bold',
        fontSize: 24
      },
      heading3Style: {
        fontName: 'HelveticaNeue-Bold',
        fontSize: 19
      },
      heading4Style: {
        fontName: 'HelveticaNeue-Bold',
        fontSize: 16
      },
      heading5Style: {
        fontName: 'HelveticaNeue-Bold',
        fontSize: 13
      },
      heading6Style: {
        fontName: 'HelveticaNeue-Bold',
        fontSize: 11
      }
    },
    textStyles: {
      bodyBoldStyle: {
        fontName: 'HelveticaNeue-Bold'
      },
      bodyItalicStyle: {
        fontName: 'HelveticaNeue-Italic'
      },
      bodyBoldItalicStyle: {
        fontName: 'HelveticaNeue-BoldItalic'
      },
      bodyLinkTextStyle: {
        textColor: '#48BFEE',
        underline: true
      }
    },
    components: [
      {
        role: 'heading1',
        text: 'header 1 text',
        textStyle: 'heading1Style',
        additions: [],
        inlineTextStyles: []
      },
      {
        role: 'heading2',
        text: 'header 2 text',
        textStyle: 'heading2Style',
        additions: [],
        inlineTextStyles: []
      },
      {
        role: 'heading3',
        text: 'header 3 text',
        textStyle: 'heading3Style',
        additions: [],
        inlineTextStyles: []
      },
      {
        role: 'heading4',
        text: 'header 4 text',
        textStyle: 'heading4Style',
        additions: [],
        inlineTextStyles: []
      },
      {
        role: 'heading5',
        text: 'header 5 text',
        textStyle: 'heading5Style',
        additions: [],
        inlineTextStyles: []
      },
      {
        role: 'heading6',
        text: 'header 6 text',
        textStyle: 'heading6Style',
        additions: [],
        inlineTextStyles: []
      },
      {
        role: 'body',
        text: 'link\nnormal text bold text italic text bold italic text marked text\n',
        textStyle: 'bodyStyle',
        additions: [
          {
            'type': 'link',
            'rangeStart': 0,
            'rangeLength': 4,
            'URL': 'http://mic.com'
          }
        ],
        'inlineTextStyles': [
          {
            'rangeStart': 0,
            'rangeLength': 4,
            'textStyle': 'bodyLinkTextStyle'
          },
          {
            'rangeStart': 17,
            'rangeLength': 10,
            'textStyle': 'bodyBoldStyle'
          },
          {
            'rangeStart': 27,
            'rangeLength': 12,
            'textStyle': 'bodyItalicStyle'
          },
          {
            'rangeStart': 39,
            'rangeLength': 17,
            'textStyle': 'bodyBoldItalicStyle'
          }
        ]
      },
      {
        role: 'body',
        text: 'other text\n',
        textStyle: 'bodyStyle',
        additions: [],
        inlineTextStyles: []
      }
    ]
  };

  t.deepEqual(expected.components, apn.components);
  t.deepEqual(expected.componentTextStyles, apn.componentTextStyles);
  t.deepEqual(expected.textStyles, apn.textStyles);

  // write test article for the preview
  mkdirp.sync(path.resolve(__dirname, '..', 'apple-news-article'));
  fs.writeFileSync(path.resolve(__dirname, '..', 'apple-news-article', 'article.json'),
    JSON.stringify(apn, null, 2));
});

test('unknown element type', t => {
  const data = [
    { type: 'unknown-element', children: [] }
  ];

  const apn = toAppleNews(data, { identifier: '100', title: 'Article Title' });
  t.deepEqual(apn.components, []);
});

test('empty text element should not be rendered', t => {
  const data = [
    { type: 'paragraph', children: [
      { type: 'text', content: '' },
      { type: 'other', content: 'a' },
      { type: 'text' }
    ] }
  ];

  const apn = toAppleNews(data, { identifier: '100', title: 'Article Title' });
  t.deepEqual(apn.components, []);
});
