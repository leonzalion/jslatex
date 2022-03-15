import { outdent } from 'outdent';
import escapeStringRegexp from 'escape-string-regexp';
import { r } from './regex.js';

const tagDelimeters = ['?'];

export function getRepository() {
	const ejsBeginTag = (delimiter: string) =>
		`<${escapeStringRegexp(delimiter)}[_=-]?`;
	const ejsEndTag = (delimiter: string) =>
		`[_-]?${escapeStringRegexp(delimiter)}>`;

	return {
		// Comments that use the EJS <?# tag
		'tag-block-comment': {
			name: 'comment.block.ejs',
			contentName: 'comment.block.js',
			begin: '<(\\?)#',
			beginCaptures: {
				'0': {
					name: 'punctuation.definition.comment.js',
				},
			},
			end: String.raw`\1>`,
			endCaptures: {
				'0': {
					name: 'punctuation.definition.comment.js',
				},
			},
		},
		'tag-ejs': {
			patterns: tagDelimeters.map((char) => ({
				begin: r(
					outdent.string(String.raw`
						(${ejsBeginTag(char)})
						(
							(?:
								(?!${ejsEndTag(char)}).
							)*
						)
					`)
				),
				beginCaptures: {
					'1': {
						name: 'punctuation.section.embedded.begin',
					},
					'2': {
						name: 'meta.embedded.ejs',
						patterns: [{ include: 'source.js' }],
					},
				},
				end: r(
					outdent.string(String.raw`
						(
							(?:
								(?!${ejsEndTag(char)}).
							)*
						)
						(${ejsEndTag(char)})
					`)
				),
				endCaptures: {
					'1': {
						name: 'meta.embedded.ejs',
						patterns: [{ include: 'source.js' }],
					},
					'2': {
						name: 'punctuation.section.embedded.end',
					},
				},
				// Matched against the part between the begin and end matches
				patterns: [
					{
						contentName: 'meta.embedded.js',
						begin: String.raw`(?:^|\G).*`,
						// the `.*` is needed so that we can have JS before the end tag
						while: String.raw`(?:^|\G)((?!.*${ejsEndTag(char)}))`,
						patterns: [{ include: 'source.js' }],
					},
				],
			})),
		},
		'single-line-tag-ejs': {
			patterns: tagDelimeters.map((char) => ({
				begin: r(
					outdent.string(String.raw`
						(${ejsBeginTag(char)})
						(
							(?:
								(?!${ejsEndTag(char)}).
							)+
						)
						(?=${ejsEndTag(char)})
					`)
				),
				beginCaptures: {
					'1': {
						name: 'punctuation.section.embedded.begin',
					},
					'2': {
						name: 'meta.embedded.ejs',
						patterns: [{ include: 'source.js' }],
					},
				},
				end: ejsEndTag(char),
				endCaptures: {
					'0': {
						name: 'punctuation.section.embedded.end',
					},
				},
			})),
		},
	};
}