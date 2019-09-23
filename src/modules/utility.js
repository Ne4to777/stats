/* eslint func-names:0 */
/* eslint no-eval:0 */
/* eslint no-unused-vars:0 */

const { log } = console


export const identity = x => x


// x:string -> y:object -> z:any
export const getPropByPath = path => x => function () {
	return eval(path)
}.call(x)
// log(getPropByPath('this.a')({ a: 'getPropByPath' })) // getPropByPath
// log(getPropByPath('this.a.b()')({ a: { b: () => 'getPropByPath' } })) // getPropByPath


// x:function<(a:y, b:k, i:number) -> a> -> y:any -> z:array<k:any> -> x:y
export const reduce = f => init => xs => xs.reduce(f, init)
// log(reduce((acc, x) => x)()([1, 2, 3])) // [1, 2, 3]
// log(reduce((acc, x, i) => acc.concat(x + i))([])([1, 2, 3])) // [1, 3, 5]


// x:array<function> -> y: any
export const pipe = reduce((acc, f) => x => f(acc(x)))(identity)
// log(pipe([identity])('pipe')) // pipe
// log(pipe([x => x + 1, x => `pipe: ${x}`])(1)) // pipe: 2


// x:string -> y:array<object> -> z:object
export const accumulateValuesByProp = propPath => reduce((acc, x) => {
	const key = getPropByPath(propPath)(x)
	if (!acc[key]) acc[key] = 0
	acc[key] += 1
	return acc
})({})
// log(accumulateValuesByProp('this.a')([{ a: 1 }, { a: 2 }])) // {1: 1, 2: 1}
// log(accumulateValuesByProp('this.a.b()')([{ a: { b: () => 'x' } }, { a: { b: () => 'y' } }])) // {x: 1, y: 1}

// x:object -> y:array<any>
export const countsToArray = o => {
	const items = []
	const keys = Object.keys(o)
	for (let i = 0; i < keys.length; i += 1) {
		const key = keys[i]
		items.push({ key, count: o[key] })
	}
	return items
}
// log(countsToArray({ a: 1, b: 2 })) // [{key: 'a', count: 1},{key: 'b', count: 2}]


// x:string -> y:array<object> -> z:object
export const map = key => reduce((acc, el) => {
	acc[el[key]] = el
	return acc
})({})
// log(map('a')([{ a: 1 }, { a: 2 }])) // {1: {a: 1}, 2: {a: 2}}

// x:array<object>
export const mergeStats = ([stats1, stats2]) => {
	const result = {}
	const idsMapped = reduce((acc, el) => {
		acc[el] = true
		return acc
	})({})(Object.keys(stats1).concat(Object.keys(stats2)))

	const ids = Object.keys(idsMapped)
	for (let i = 0; i < ids.length; i += 1) {
		const id = ids[i]
		const stat1 = stats1[id]
		const stat2 = stats2[id]
		if (stat1) {
			if (stat2) {
				result[id] = stat1 + stat2
			} else {
				result[id] = stat1
			}
		} else if (stat2) {
			result[id] = stat2
		} else {
			result[id] = 0
		}
	}
	return result
}
// console.log(mergeStats([{ 1: 1 }, { 1: 2 }])) // {1: 3}

export const callbackLog = res => {
	console.log(res)
	return res
}


export const parseUsername = title => {
	let friendlyName = ''
	let firstName = ''
	let lastName = ''
	if (title) {
		const nameSplits = title.trim().split(/\s\s*/)
		switch (nameSplits.length) {
			case 1:
				firstName = title
				lastName = ''
				break
			case 2:
			case 3:
				[lastName, firstName] = nameSplits
				break
			case 4:
				if (/^кызы$|^оглы$/i.test(nameSplits[3])) {
					[lastName, firstName] = nameSplits
				} else {
					[, , firstName] = nameSplits
					lastName = `${nameSplits[0]} ${nameSplits[1]}`
				}
				break
			case 5:
				firstName = `${nameSplits[3]} ${nameSplits[0]}`
				lastName = `${nameSplits[1]} ${nameSplits[2]}`
				break
			default:
			// default
		}
		friendlyName = [firstName, lastName].join(' ')
	}
	return {
		firstname: firstName,
		lastname: lastName,
		friendlyName
	}
}
