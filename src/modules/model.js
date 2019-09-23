/* eslint max-len:0 */

import { reduce } from './utility'

// init
spx().user().setDefaults({
	customWebTitle: 'AM',
	customListTitle: 'UsersAD',
	customIdColumn: 'uid',
	customLoginColumn: 'Login',
	customNameColumn: 'Title',
	customEmailColumn: 'Email',
	customQuery: 'Number deleted Neq 1 and (Email IsNotNull and (Position Neq Неактивный сотрудник and Position Neq Резерв))'
})

// classes
class Cache {
	constructor(stores) {
		this.driver = new Dexie('db')
		this.stores = stores
		this.initStores()
	}

	initStores() {
		this.driver.version(1).stores(this.stores)
	}

	getStore(name) {
		return this.driver[name].toArray().catch(err => {
			this.deleteCache()
			return err
		})
	}

	setStore(name, items) {
		this.driver[name].bulkAdd(items).catch(err => err.message)
	}

	clearStore(name) {
		this.driver[name].clear()
	}

	deleteCache() {
		this.driver.delete()
	}
}


class DB {
	constructor(stores) {
		this.stores = stores
	}

	get(name) {
		return this.stores[name]()
	}
}


class Hybrid {
	constructor({ name, key }) {
		this.name = name
		this.key = key
		this.db = new DB(params.db.stores)
		this.cache = new Cache(params.cache.stores)
		// this.cache.deleteCache()
	}

	async get(params = {}) {
		const { verbose, keys = [] } = params
		let result
		const itemsCached = await this.cache.getStore(this.name)

		if (itemsCached.length) {
			result = itemsCached
		} else {
			const items = await this.db.get(this.name)

			const itemsMapped = reduce((acc, el) => {
				acc[el[this.key]] = el
				return acc
			})({})(items)

			const filteredItems = keys.length ? reduce((acc, el) => {
				if (itemsMapped[el]) acc.push(itemsMapped[el])
				return acc
			})([])(keys) : items

			if (filteredItems.length) await this.cache.setStore(this.name, filteredItems)
			result = filteredItems
		}
		if (verbose) console.log(result)
		return result
	}

	clearCache() {
		this.cache.clearStore(this.name)
	}
}

// webs
const appWeb = spx('app')
const crowdWeb = spx('crowd')
const libraryWeb = spx('app-library')
const intellectWeb = spx('Intellect')
const wikiWeb = spx('wikilibrary/wiki')
const socialWeb = spx('social')

// lists
const blogsList = appWeb.list('Blogs')
const ideasList = crowdWeb.list('Ideas')
const actionList = appWeb.list('Action')
const commentList = appWeb.list('Comment')
const discussionList = crowdWeb.list('Список обсуждений')
const usersList = spx().user('/')
const libraryList = libraryWeb.list('Library')
const tripsList = intellectWeb.list('Отчеты о командировках')
const wikiList = wikiWeb.list('Pages')
const subscribesList = socialWeb.list('Followers')


// getters
const getActions = libPath => actionList.item(`iLibrary eq ${libPath} and iCheckEmotion1 isNotNull`).get({ view: ['ID', 'iID', 'iCheckEmotion1'] })

// params
const params = {
	cache: {
		stores: {
			users: '&uid,Title,Position,ShortPath',
			usersGrouped: '&ID,data',
			blogs: '&ID,iAuthor',
			ideas: '&ID,Author',
			actionBlogs: '&ID,iID,iCheckEmotion1',
			actionIdeas: '&ID,iID,iCheckEmotion1',
			actionComments: '&ID,iID,iCheckEmotion1',
			commentBlogs: '&ID,iID,iAuthor,iParent',
			commentIdeas: '&ID,Author,IdeaID,ParentItemID,ParentFolderId,LikesCount',
			analyticalWorks: '&ID,authorUser',
			trips: '&ID,_x0423__x0447__x0430__x0441__x0442__x043d__x0438__x043a_',
			wikiPages: '&ID,Author',
			subscribes: '&ID,follower,leader'
		}
	},
	db: {
		stores: {
			users: () => usersList.get({ view: ['uid', 'Title', 'Position', 'ShortPath'] }),
			usersGrouped: () => usersList.get({ view: ['uid', 'Title', 'Position', 'ShortPath'], groupBy: 'Title' }).then(res => [{ ID: 1, data: res }]),
			blogs: () => blogsList.item('Boolean iProfessional eq true').get({ view: ['ID', 'iAuthor'] }),
			ideas: () => ideasList.item().get({ view: ['ID', 'Author'] }),
			actionBlogs: () => getActions('/app/Blogs'),
			actionIdeas: () => getActions('/crowd/Ideas'),
			actionComments: () => getActions('/app/Comment'),
			commentBlogs: () => commentList.item('iLibrary eq /app/Blogs').get({ view: ['ID', 'iID', 'iAuthor', 'iParent'] }),
			commentIdeas: () => discussionList.item({ Scope: 'allitems' }).get({ view: ['ID', 'Author', 'IdeaID', 'ParentItemID', 'ParentFolderId', 'LikesCount'] }),
			analyticalWorks: () => libraryList.item('typeDocument eq analytical-work').get({ view: ['ID', 'creator'] }),
			trips: () => tripsList.item().get({ view: ['ID', '_x0423__x0447__x0430__x0441__x0442__x043d__x0438__x043a_'] }),
			wikiPages: () => wikiList.item().get({ view: ['ID', 'Author'] }),
			subscribes: () => subscribesList.item({ Scope: 'allitems' }).get({ view: ['ID', 'follower', 'leader'] })
		}
	}
}

// export
export default reduce((acc, el) => {
	acc[el.name] = new Hybrid(el)
	return acc
})({})([
	{ name: 'users', key: 'uid' },
	{ name: 'usersGrouped', key: 'ID' },
	{ name: 'blogs', key: 'ID' },
	{ name: 'ideas', key: 'ID' },
	{ name: 'actionBlogs', key: 'ID' },
	{ name: 'actionIdeas', key: 'ID' },
	{ name: 'actionComments', key: 'ID' },
	{ name: 'commentBlogs', key: 'ID' },
	{ name: 'commentIdeas', key: 'ID' },
	{ name: 'analyticalWorks', key: 'ID' },
	{ name: 'trips', key: 'ID' },
	{ name: 'wikiPages', key: 'ID' },
	{ name: 'subscribes', key: 'ID' }
])
