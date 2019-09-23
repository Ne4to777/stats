<template>
	<div>
		<export-excel :data="itemsToExport">Download Data</export-excel>
		<!-- <button type="submit" @click="exportData"></button> -->
		<b-table striped hover :items="items" :fields="fields"></b-table>
	</div>
</template>

<script>
/* eslint-disable no-param-reassign */
import getStats from '@/modules'
import m from '@/modules/model'
import { countsToArray, reduce } from '@/modules/utility'

// import json2xlsx from '@/modules/json2xlsx'

export default {
	name: 'home',
	data() {
		return {
			itemsToExport: [
				[
					'Ф.И.О.',
					'Кол-во постов',
					'Кол-во чужих лайков к собственным постам',
					'Кол-во чужих комментариев к собственным постам',
					'Кол-во комментариев к чужим постам',
					'Кол-во лайков к собственным комментариям',
					'Кол-во комментариев на собственные комментарии',
					'Кол-во аналитических материалов',
					'Кол-во отчетов по командировкам',
					'Кол-во страниц авиа-вики',
					'Взаимные подписчики'
				]
			],
			items: [],
			fields: [
				{
					key: 'Ф.И.О.',
					sortable: true
				},
				{
					key: 'Кол-во постов',
					sortable: true
				},
				{
					key: 'Кол-во чужих лайков к собственным постам',
					sortable: true
				},
				{
					key: 'Кол-во чужих комментариев к собственным постам',
					sortable: true
				},
				{
					key: 'Кол-во комментариев к чужим постам',
					sortable: true
				},
				{
					key: 'Кол-во лайков к собственным комментариям',
					sortable: true
				},
				{
					key: 'Кол-во комментариев на собственные комментарии',
					sortable: true
				},
				{
					key: 'Кол-во аналитических материалов',
					sortable: true
				},
				{
					key: 'Кол-во отчетов по командировкам',
					sortable: true
				},
				{
					key: 'Кол-во страниц авиа-вики',
					sortable: true
				},
				{
					key: 'Взаимные подписчики',
					sortable: true
				}
			]
		}
	},
	created() {
		this.getItems()
	},
	methods: {
		async getItems() {
			const stats = await getStats()
			// console.log(stats)
			const users = await m.users.get()
			const usersByUid = reduce((acc, el) => {
				acc[el.uid] = el.Title
				return acc
			})({})(users)
			const statNames = Object.keys(stats)
			const dataMapped = reduce((acc, statName) => {
				const stat = stats[statName]
				const userIds = Object.keys(stat)
				return reduce((accStat, id) => {
					if (!accStat[id]) accStat[id] = {}
					accStat[id][statName] = stat[id]
					return accStat
				})(acc)(userIds)
			})({})(statNames)
			// console.log(dataMapped)

			const userIds = Object.keys(dataMapped)

			const data = reduce((acc, userId) => {
				const {
					posts,
					likesForPosts,
					commentsForPosts,
					ownCommentsForPosts,
					likesForCommentsForPosts,
					commentsForCommentsForPosts,
					analyticalWorks,
					trips,
					aviaWiki,
					subscribes
				} = dataMapped[userId]
				const username = usersByUid[userId]
				if (username) {
					const items = [
						username,
						posts || 0,
						likesForPosts || 0,
						commentsForPosts || 0,
						ownCommentsForPosts || 0,
						likesForCommentsForPosts || 0,
						commentsForCommentsForPosts || 0,
						analyticalWorks || 0,
						trips || 0,
						aviaWiki || 0,
						subscribes || 0
					]
					acc.push(items)
				}
				return acc
			})([])(userIds)
			// console.log(data)
			console.log('done')

			this.itemsToExport = this.itemsToExport.concat(data)
		},
		exportData() {
			json2xlsx({ data: this.items })
		}
	}
}
</script>
