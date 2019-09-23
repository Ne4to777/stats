/* eslint  no-underscore-dangle:0 */
/* eslint prefer-destructuring:0 */
/* eslint no-continue:0 */
/* eslint no-bitwise:0 */
import XLSX from 'xlsx'
import { saveAs } from 'file-saver'

function s2ab(s) {
	const buf = new ArrayBuffer(s.length)
	const view = new Uint8Array(buf)
	for (let i = 0; i !== s.length; i += 1) view[i] = s.charCodeAt(i) & 0xFF
	return buf
}

function Workbook() {
	if (!(this instanceof Workbook)) return new Workbook()
	this.SheetNames = []
	this.Sheets = {}
}

function datenum(v, date1904) {
	let x = v
	if (date1904) x += 1462
	return (Date.parse(x) - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000)
}

function sheetFromArrayOfArrays(data) {
	const ws = {}
	const range = {
		s: {
			c: 10000000,
			r: 10000000
		},
		e: {
			c: 0,
			r: 0
		}
	}
	for (let R = 0; R !== data.length; R += 1) {
		for (let C = 0; C !== data[R].length; C += 1) {
			if (range.s.r > R) range.s.r = R
			if (range.s.c > C) range.s.c = C
			if (range.e.r < R) range.e.r = R
			if (range.e.c < C) range.e.c = C
			const cell = {
				v: data[R][C]
			}
			if (cell.v == null) continue
			const cellRef = XLSX.utils.encode_cell({
				c: C,
				r: R
			})

			if (typeof cell.v === 'number') cell.t = 'n'
			else if (typeof cell.v === 'boolean') cell.t = 'b'
			else if (cell.v instanceof Date) {
				cell.t = 'n'
				cell.z = XLSX.SSF._table[14]
				cell.v = datenum(cell.v)
			} else cell.t = 's'

			ws[cellRef] = cell
		}
	}
	if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range)
	return ws
}
export default function json2excel({
	multiHeader = [],
	header,
	data,
	filename,
	merges = [],
	autoWidth = true,
	bookType = 'xlsx'
} = {}) {
	filename = filename || 'excel-list'
	data = [...data]
	// data.unshift(header)
	console.log(data)

	for (let i = multiHeader.length - 1; i > -1; i -= 1) {
		data.unshift(multiHeader[i])
	}

	const wsName = 'SheetJS'
	const wb = new Workbook()
	const ws = sheetFromArrayOfArrays(data)

	if (merges.length > 0) {
		if (!ws['!merges']) ws['!merges'] = []
		merges.forEach(item => {
			ws['!merges'].push(XLSX.utils.decode_range(item))
		})
	}

	if (autoWidth) {
		const colWidth = data.map(row => row.map(val => {
			if (val == null) {
				return {
					wch: 10
				}
			}

			if (val.toString().charCodeAt(0) > 255) {
				return {
					wch: val.toString().length * 2
				}
			}
			return {
				wch: val.toString().length
			}
		}))

		const result = colWidth[0]
		for (let i = 1; i < colWidth.length; i += 1) {
			for (let j = 0; j < colWidth[i].length; j += 1) {
				if (result[j].wch < colWidth[i][j].wch) {
					result[j].wch = colWidth[i][j].wch
				}
			}
		}
		ws['!cols'] = result
	}

	/* add worksheet to workbook */
	wb.SheetNames.push(wsName)
	wb.Sheets[wsName] = ws

	const wbout = XLSX.write(wb, {
		bookType,
		bookSST: false,
		type: 'binary'
	})
	saveAs(new Blob([s2ab(wbout)], {
		type: 'application/octet-stream'
	}), `${filename}.${bookType}`)
}
