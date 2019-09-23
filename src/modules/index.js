/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint no-restricted-syntax:0 */
/* eslint guard-for-in:0 */
/* eslint no-continue:0 */
/* eslint max-len:0 */
/* eslint no-unused-vars:0 */
import m from '@/modules/model'
import {
	accumulateValuesByProp, map, reduce, mergeStats, callbackLog, parseUsername
} from '@/modules/utility'

export default async _ => ({
	posts: mergeStats(await Promise.all([getBlogsStat(), getIdeasStat()])),
	likesForPosts: mergeStats(await Promise.all([getLikesForBlogsStat(), getLikesForIdeasStat()])),
	commentsForPosts: mergeStats(await Promise.all([getCommentsForBlogsStat(), getCommentsForIdeasStat()])),
	ownCommentsForPosts: mergeStats(await Promise.all([getOwnCommentsForBlogsStat(), getOwnCommentsForIdeasStat()])),
	likesForCommentsForPosts: mergeStats(await Promise.all([getLikesForCommentsForBlogsStat(), getLikesForCommentsForIdeasStat()])),
	commentsForCommentsForPosts: mergeStats(await Promise.all([getCommentsForCommentsForBlogsStat(), getCommentsForCommentsForIdeasStat()])),
	analyticalWorks: await getAnalyticalWorksStat(),
	trips: await getTripsStat(),
	aviaWiki: await getAviaWikiStat(),
	subscribes: await getSubscribes()
})

// ===============================

const getBlogsStat = async _ => {
	const blogs = await m.blogs.get()
	// console.log(blogs)
	const blogsCount = accumulateValuesByProp('this.iAuthor.$1E_1')(blogs)
	// console.log(blogsCount)
	return blogsCount
}

const getIdeasStat = async _ => {
	const ideas = await m.ideas.get()
	// console.log(ideas)
	const ideasCount = accumulateValuesByProp('this.Author.$1E_1')(ideas)
	// console.log(ideasCount)
	return ideasCount
}


// ===============================

const getLikesForBlogsStat = async _ => {
	const blogsMapped = map('ID')(await m.blogs.get())
	// console.log(blogsMapped)

	return reduce((acc, el) => {
		if (!blogsMapped[el.iID]) return acc
		const authorId = blogsMapped[el.iID].iAuthor.$1E_1
		if (!acc[authorId]) acc[authorId] = 0
		const likesForBlogs = el.iCheckEmotion1
			? JSON.parse(el.iCheckEmotion1)
			: {}
		delete likesForBlogs[authorId]
		acc[authorId] += Reflect.ownKeys(likesForBlogs).length
		return acc
	})({})(await m.actionBlogs.get())
}

const getLikesForIdeasStat = async _ => {
	const ideasMapped = map('ID')(await m.ideas.get())
	// console.log(ideasMapped)

	return reduce((acc, el) => {
		if (!ideasMapped[el.iID]) return acc
		const authorId = ideasMapped[el.iID].Author.$1E_1
		if (!acc[authorId]) acc[authorId] = 0
		const likesForIdeas = el.iCheckEmotion1
			? JSON.parse(el.iCheckEmotion1)
			: {}
		delete likesForIdeas[authorId]
		acc[authorId] += Reflect.ownKeys(likesForIdeas).length
		return acc
	})({})(await m.actionIdeas.get())
}

// ===============================

const getCommentsForBlogsStat = async _ => {
	const blogsMapped = map('ID')(await m.blogs.get())
	// m.commentBlogs.clearCache()
	return reduce((acc, el) => {
		if (!blogsMapped[el.iID] || el.iParent) return acc
		const postAuthorId = blogsMapped[el.iID].iAuthor.$1E_1
		const commentAuthorId = el.iAuthor.$1E_1
		if (commentAuthorId === postAuthorId) return acc
		if (!acc[postAuthorId]) acc[postAuthorId] = 0
		acc[postAuthorId] += 1
		return acc
	})({})(await m.commentBlogs.get())
}

const getCommentsForIdeasStat = async _ => {
	const ideasMapped = map('ID')(await m.ideas.get())
	// m.commentIdeas.clearCache()
	return reduce((acc, el) => {
		if (!ideasMapped[el.IdeaID.$1E_1] || el.ParentItemID !== el.ParentFolderId) return acc
		const postAuthorId = ideasMapped[el.IdeaID.$1E_1].Author.$1E_1
		const commentAuthorId = el.Author.$1E_1
		if (commentAuthorId === postAuthorId) return acc
		if (!acc[postAuthorId]) acc[postAuthorId] = 0
		acc[postAuthorId] += 1
		return acc
	})({})(await m.commentIdeas.get())
}


// ===============================

const getOwnCommentsForBlogsStat = async _ => {
	const blogsMapped = map('ID')(await m.blogs.get())
	// m.commentBlogs.clearCache()
	return reduce((acc, el) => {
		if (!blogsMapped[el.iID] || el.iParent) return acc
		const postAuthorId = blogsMapped[el.iID].iAuthor.$1E_1
		const commentAuthorId = el.iAuthor.$1E_1
		if (commentAuthorId === postAuthorId) return acc
		if (!acc[commentAuthorId]) acc[commentAuthorId] = 0
		acc[commentAuthorId] += 1
		return acc
	})({})(await m.commentBlogs.get())
}

const getOwnCommentsForIdeasStat = async _ => {
	const ideasMapped = map('ID')(await m.ideas.get())
	// m.commentIdeas.clearCache()
	return reduce((acc, el) => {
		if (!ideasMapped[el.IdeaID.$1E_1] || el.ParentItemID !== el.ParentFolderId) return acc
		const postAuthorId = ideasMapped[el.IdeaID.$1E_1].Author.$1E_1
		const commentAuthorId = el.Author.$1E_1
		if (commentAuthorId === postAuthorId) return acc
		if (!acc[commentAuthorId]) acc[commentAuthorId] = 0
		acc[commentAuthorId] += 1
		return acc
	})({})(await m.commentIdeas.get())
}


// ===============================

const getLikesForCommentsForBlogsStat = async _ => {
	const commentsMapped = map('ID')(await m.commentBlogs.get())
	return reduce((acc, el) => {
		if (!commentsMapped[el.iID]) return acc
		const commentAuthorId = commentsMapped[el.iID].iAuthor.$1E_1
		if (!acc[commentAuthorId]) acc[commentAuthorId] = 0
		acc[commentAuthorId] += el.iCheckEmotion1 ? Object.keys(JSON.parse(el.iCheckEmotion1)).length : 0
		return acc
	})({})(await m.actionComments.get())
}

const getLikesForCommentsForIdeasStat = async _ => reduce((acc, el) => {
	if (!el.LikesCount) return acc
	const commentAuthorId = el.Author.$1E_1
	if (!acc[commentAuthorId]) acc[commentAuthorId] = 0
	acc[commentAuthorId] += el.LikesCount
	return acc
})({})(await m.commentIdeas.get())


// ===============================

const getCommentsForCommentsForBlogsStat = async _ => {
	const comments = await m.commentBlogs.get()
	const commentsMapped = map('ID')(comments)

	// m.commentBlogs.clearCache()
	return reduce((acc, el) => {
		if (!el.iParent) return acc
		const parentComment = commentsMapped[el.iParent.$1E_1]
		if (!parentComment) return acc
		const parentCommentAuthorId = parentComment.iAuthor.$1E_1
		const commentAuthorId = el.iAuthor.$1E_1
		if (parentCommentAuthorId === commentAuthorId) return acc
		if (!acc[parentCommentAuthorId]) acc[parentCommentAuthorId] = 0
		acc[parentCommentAuthorId] += 1
		return acc
	})({})(comments)
}

const getCommentsForCommentsForIdeasStat = async _ => {
	const comments = await m.commentIdeas.get()
	const commentsMapped = map('ID')(comments)
	// m.commentIdeas.clearCache()
	return reduce((acc, el) => {
		const parentComment = commentsMapped[el.ParentItemID]
		if (!parentComment) return acc
		const parentCommentAuthorId = parentComment.Author.$1E_1
		const commentAuthorId = el.Author.$1E_1
		if (parentCommentAuthorId === commentAuthorId) return acc
		if (!acc[parentCommentAuthorId]) acc[parentCommentAuthorId] = 0
		acc[parentCommentAuthorId] += 1
		return acc
	})({})(await m.commentIdeas.get())
}

// ===============================

const getAnalyticalWorksStat = async _ => {
	// m.analyticalWorks.clearCache()
	const analyticalWorks = await m.analyticalWorks.get()
	// m.usersGrouped.clearCache()
	const usersGrouped = await m.usersGrouped.get().then(res => res[0].data)

	const usersReGrouped = reduce((acc, el) => {
		const user = usersGrouped[el]
		const { firstname, lastname } = parseUsername(el)
		const fullname = `${firstname} ${lastname}`
		if (!acc[fullname]) acc[fullname] = []
		acc[fullname] = acc[fullname].concat(user)
		return acc
	})({})(Object.keys(usersGrouped))

	// console.log(usersGrouped)
	// console.log(usersReGrouped)
	const userIdByNames = {}
	const works = reduce((acc, el) => {
		const names = JSON.parse(el.creator)
		return reduce((creatorsStat, name) => {
			if (!usersGrouped[name] && !usersReGrouped[name]) return creatorsStat
			// if (usersReGrouped[name] && usersReGrouped[name].length > 1) console.log(usersReGrouped[name])
			const group = usersGrouped[name] || usersReGrouped[name]
			const groupFiltered = group.length > 1 ? group.filter(user => /СГ/.test(user.ShortPath)) : group

			if (groupFiltered.length) {
				const groupItem = groupFiltered[0]
				const fullname = groupItem.Title
				userIdByNames[fullname] = groupItem.uid
				if (!creatorsStat[fullname]) creatorsStat[fullname] = 0
				creatorsStat[fullname] += 1
			}
			return creatorsStat
		})(acc)(names)
	})({})(analyticalWorks)
	// console.log(works)
	const usernames = Object.keys(works)
	const result = {}
	for (let i = 0; i < usernames.length; i += 1) {
		const username = usernames[i]
		if (userIdByNames[username]) {
			result[userIdByNames[username]] = works[username]
		}
	}
	return result
}

// ===============================

const getTripsStat = async _ => {
	const trips = await m.trips.get()
	// console.log(trips)
	return reduce((acc, el) => {
		const users = el._x0423__x0447__x0430__x0441__x0442__x043d__x0438__x043a_
		return users ? reduce((accInternal, user) => {
			const userId = user.$1E_1
			if (!accInternal[userId]) accInternal[userId] = 0
			accInternal[userId] += 1
			return accInternal
		})(acc)(users) : acc
	})({})(trips)
}

// ===============================

const getAviaWikiStat = async _ => {
	const wikiPages = await m.wikiPages.get()
	// console.log(wikiPages)
	// m.usersGrouped.clearCache()
	const usersGrouped = await m.usersGrouped.get().then(res => res[0].data)
	const namesMapped = {}
	const result = reduce((acc, el) => {
		const username = el.Author.$2e_1
		namesMapped[username] = el
		const userGroup = usersGrouped[username]
		if (userGroup) {
			// if (userGroup.length > 1) console.log(userGroup)
			const userId = userGroup[0].uid
			if (!acc[userId]) acc[userId] = 0
			acc[userId] += 1
		}
		return acc
	})({})(wikiPages)
	// console.log(namesMapped)
	return result
}

// ===============================

const getSubscribes = async _ => {
	const subscribes = await m.subscribes.get()
	// console.log(subscribes)
	const subscribesMapped = reduce((acc, el) => {
		const followerId = el.follower.$1E_1
		const leaderId = el.leader.$1E_1
		if (!acc[followerId]) acc[followerId] = {}
		acc[followerId][leaderId] = true
		return acc
	})({})(subscribes)
	// console.log(subscribesMapped)

	return reduce((acc, el) => {
		const followerId = el.follower.$1E_1
		const leaderId = el.leader.$1E_1
		if (subscribesMapped[leaderId] && subscribesMapped[leaderId][followerId]) {
			if (!acc[followerId]) acc[followerId] = 0
			acc[followerId] += 1
		}
		return acc
	})({})(subscribes)
}
