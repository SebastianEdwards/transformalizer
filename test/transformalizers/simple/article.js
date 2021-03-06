import R from 'ramda'

import { determineLanguage, links, meta } from './common'

const article = {
  name: 'article',
  schema: {
    data: {
      type: R.always('article'),

      id({ source, options, data }) { // eslint-disable-line
        return R.prop('_id', data)
      },

      attributes({ source, options, data, id }) { // eslint-disable-line
        const src = R.propOr({}, '_source', data)
        const languageAvailability = R.propOr([], 'languageAvailability', src)
        const primaryLanguage = R.prop('primaryLanguage', src)
        options.language = determineLanguage({
          language: options.language,
          languageAvailability,
          primaryLanguage,
        })
        // define spec with universal attributes
        const attributes = {
          createdAt: R.prop('createdAt', src),
          primaryLanguage,
        }
        // if a language is available, add it to the spec
        if (options.language) {
          attributes.alternateTitle = R.prop(`alternateTitle_${options.language}`, src)
          attributes.title = R.prop(`title_${options.language}`, src)
        }
        return attributes
      },

      relationships: {
        people({ source, options, data, id, attributes }) { // eslint-disable-line
          const people = R.path(['_source', 'people'], data)
          const result = {
            links: {
              self: `${options.baseUrl}/content/articles/${id}/relationships/people`,
              related: `${options.baseUrl}/content/articles/${id}/people`,
            },
          }
          if (Array.isArray(people) && people.length) {
            result.data = people.map((person) => {
              const { name, roles } = person
              const included = !!name
              return {
                name: 'person',
                data: {
                  _id: person.id,
                  _source: person,
                },
                included,
                meta: { roles },
              }
            })
          }
          return result
        },
      },

      links({ options, id }) { // eslint-disable-line
        return {
          self: `${options.baseUrl}/content/articles/${id}${options.language ? `?language=${options.language}` : ''}`,
        }
      },

      meta({ attributes, data, id, input, options, relationships, type }) { // eslint-disable-line
        if (options.language) {
          return { language: options.language }
        }
        return undefined
      },
    },

    links,

    meta,
  },
}

export default article
