import data from '../data/goods.json';
import get from 'lodash.get';

const sortParams = {
	1: {
		field: 'price.value',
		type: 'asc'
	},
	2: {
		field: 'price.value',
		type: 'decs'
	},
	3: {
		field: 'year',
		type: 'asc'
	},
	4: {
		field: 'year',
		type: 'decs'
	}
};

const queryParams = {
	brand: 'brand.id',
	price: 'price.value',
	manufacturer: 'manufacturer.id',
	model: 'model.id',
	year: 'year'
};

export class LikeServer {
	constructor() {
		this.defaultSettings = {
			perPage: 6,
			sort: '1',
			page: 1
		};
	}

	sorting(param, data) {
		const localParam = sortParams[param.sort];

		return data.sort((a, b) => {
			return localParam.type === 'asc'
				? get(a, localParam.field, 0) - get(b, localParam.field, 0)
				: get(b, localParam.field, 0) - get(a, localParam.field, 0);
		});
	}

	pagination(pagination, data) {
		const sortedData = this.sorting(pagination, data);
		const totalPages = Math.round(sortedData.length / pagination.perPage);
		const needData = sortedData.splice(
			pagination.page === 1 ? 0 : pagination.perPage * (pagination.page - 1),
			pagination.page === 1
				? pagination.perPage
				: pagination.perPage * pagination.page
		);
		return {
			data: needData,
			pagination: {
				totalPages,
				page: pagination.page,
				perPage: pagination.perPage
			}
		};
	}

	findAll(params) {
		const pagination = Object.assign({}, this.defaultSettings, params.pagination);
		const parameters = params.params;

		const filteredData = data.filter((item) => {
			let coincidences = 0;

			Object.entries(parameters).forEach(([key, val]) => {
				const fieldVal = get(item, queryParams[key], undefined);
				if (key === 'price') {
					if (val[0] <= fieldVal && fieldVal <= val[1]) {
						coincidences++;
					}

					return;
				}

				if (
					fieldVal &&
					((Array.isArray(val) && val.includes(String(fieldVal))) ||
						String(fieldVal) === val)
				) {
					coincidences++;
				}
			});

			return coincidences === Object.keys(parameters).length;
		});

		return !filteredData.length
			? { data: [], pagination: { page: 1, totalPages: 1 } }
			: this.pagination(pagination, filteredData);
	}
}
