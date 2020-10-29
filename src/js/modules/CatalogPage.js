import $ from 'js#/lib/jquery';
import { LikeServer } from 'js#/modules/LikeServer';

const queryParams = {
    page: 'page',
    year: 'year',
    price: 'price',
    model: 'model',
    manufacturer: 'manufacturer',
    brand: 'brand',
    sort: 'sort',
    perPage: 'per-page'
};

export class CatalogPage {
    constructor(page = document) {
        this.$page = $(page);
        this.$filter = this.$page.find('#filter');
        this.$sortForm = this.$page.find('#sort-form');
        this.$cards = this.$page.find('[data-cards]');
        this.$pagination = this.$page.find('[data-pagination]');
        this.cardTemplate = document.getElementById('card');
        this.server = new LikeServer();

        this.data = {};
        this.pageName = 1;

        this.getStartData();
        this.updatePage(this.server.findAll(this.data));
        this.updateControls();
        this.updateUrl();
    }

    updateUrl() {
        const queryStrArr = [];
        const allParams = { ...this.data.params, ...this.data.pagination };

        Object.entries(queryParams).forEach(([key, queryKey]) => {
            if (allParams.hasOwnProperty(key)) {
                if (Array.isArray(allParams[key])) {
                    queryStrArr.push(
                        allParams[key].map((val) => `${queryKey}[]=${val}`).join('&')
                    );
                } else {
                    queryStrArr.push(`${queryKey}=${allParams[key]}`);
                }
            }
        });

        history.pushState({ data: this.data }, '', window.location.origin + window.location.pathname + '?' + queryStrArr.join('&'));
    }

    updateData() {
        const params = {
            price: []
        };
        const pagination = {};

        this.$filter.serializeArray().forEach((field) => {
            if (field.name === 'perPage' || field.name === 'sort') {
                pagination[field.name] = field.value;
                return;
            }

            if (field.name === 'price-from' || field.name === 'price-to') {
                params.price[field.name === 'price-from' ? 0 : 1] = Number(field.value);
                return;
            }

            if (field.value && field.value.length) {
                if (params.hasOwnProperty(field.name)) {
                    params[field.name] = [...params[field.name], field.value];
                } else {
                    params[field.name] = field.value;
                }
            }
        });

        this.data = {
            pagination,
            params
        };
        this.updatePage(this.server.findAll(this.data));
        this.updateUrl();
        console.log('data', this.data);
    }

    updatePage(data) {
        if (!data.data.length) {
            this.$cards.html('<h3>Нет товаров</h3>');
        } else {
            this.$cards.html('');
            data.data.forEach((item) => {
                const clone = this.cardTemplate.content.cloneNode(true);
                clone.querySelector('[data-brand]').textContent = item.brand.name;
                const image = clone.querySelector('[data-image]');
                image.setAttribute('src', item.image.sizes['card-preview']);
                image.setAttribute('alt', item.image.alt);
                clone.querySelector('[data-manufacturer]').textContent =
                    item.manufacturer.name;
                clone.querySelector('[data-model]').textContent = item.model.name;
                clone.querySelector('[data-price]').textContent =
                    item.price.currency.symbol + item.price.value;
                clone.querySelector('[data-year]').textContent = item.year;

                this.$cards.append(clone);
            });
        }

        this.$pagination.html(this.buildPagination(data.pagination));
    }

    buildPagination(pagination) {
        const pag = pagination || this.data.pagination;

        if (pag.totalPages <= 1) {
            return '';
        }

        const createPages = () => {
            let links = '';

            for (let i = 1; i <= pag.totalPages; i++) {
                if (3 <= i && i <= pag.totalPages - 2 && pag.totalPages > 5) {
                    if (3 <= pag.page && pag.page <= pag.totalPages - 2) {
                        if (pag.page === i) {
                            links += `<${pag.page === i ? 'div' : `a href="${i}"`} class="pagination__item">${i}</${pag.page === i ? 'div' : `a`}>`;
                        } else if (3 <= pag.page && i <= pag.page - 2) {
                            links += `<${pag.page === i ? 'div' : `a href="${i}"`} class="pagination__item">...</${pag.page === i ? 'div' : `a`}>`;
                            i = pag.page - 2;
                        } else if (pag.page + 2 <= i && i <= pag.totalPages - 2) {
                            links += `<${pag.page === i ? 'div' : `a href="${i}"`} class="pagination__item">...</${pag.page === i ? 'div' : `a`}>`;
                            i = pag.totalPages - 2;
                        } else {
                            links += `<${pag.page === i ? 'div' : `a href="${i}"`} class="pagination__item">${i}</${pag.page === i ? 'div' : `a`}>`;
                        }
                    } else {
                        links += `<${pag.page === i ? 'div' : `a href="${i}"`} class="pagination__item">...</${pag.page === i ? 'div' : `a`}>`;
                        i = pag.totalPages - 2;
                    }
                } else {
                    links += `<${pag.page === i ? 'div' : `a href="${i}"`} class="pagination__item">${i}</${pag.page === i ? 'div' : `a`}>`;
                }
            }

            return links;
        };

        const paginationStr = `
            ${pag.page > 1 ? `<a href="1" class="pagination__item">&lt;&lt;</a><a href="${pag.page - 1}" class="pagination__item">&lt;</a>` : ''}
            ${createPages()}
            ${pag.page < pag.totalPages ? `<a href="${pag.page + 1}" class="pagination__item">&gt;</a><a href="${pag.totalPages}" class="pagination__item">&gt;&gt;</a>` : ''}
        `;

        return paginationStr;
    }

    getStartData() {
        if (!window.location.search.length) {
            return this.updateData();
        }

        const urlParams = new URLSearchParams(window.location.search);
        const keys = urlParams.keys();

        const values = {};
        const data = {
            params: {
                price: [100, 3000]
            },
            pagination: {
                page: 1,
                totalPages: 6,
                perPage: 6,
                sort: 1
            }
        };

        for (const key of keys) {
            const val = urlParams.getAll(key);
            values[key.replace('[]', '')] = val.length === 1 ? val[0] : val;
        }

        Object.entries(queryParams).forEach(([appKey, queryKey]) => {
            const val = values[queryKey];

            if (val) {
                if (appKey === 'sort' || appKey === 'page' || appKey === 'perPage') {
                    data.pagination[appKey] = Number(val);
                } else if (appKey === 'price') {
                    data.params[appKey] = val.map(p => Number(p));
                } else {
                    data.params[appKey] = val;
                }
            }
        });

        this.data = data;
    }

    updateControls() {
        Object.entries(this.data.pagination).forEach(([key, val]) => {
            const $el = this.$sortForm.find(`[name="${key}"]`);
            if ($el) {
                $el.val(val);
            }
        });

        Object.entries(this.data.params).forEach(([key, val]) => {
            if (key === 'price' && this.data.params.price.length) {
                this.$filter.find(`[name="price-from"]`).val(this.data.params.price[0]);
                this.$filter.find(`[name="price-to"]`).val(this.data.params.price[1]);
                return;
            }

            const els = this.$filter.find(`[name="${key}"]`);
            if (els && els.length > 1) {
                if ($(els[0]).attr('type') === 'checkbox') {
                    if (Array.isArray(val)) {
                        val.forEach((value) => {
                            this.$filter.find(`[name="${key}"][value="${value}"]`).prop('checked', true);
                        });
                    } else {
                        this.$filter.find(`[name="${key}"][value="${val}"]`).prop('checked', true);
                    }
                }
            } else if (els && els.attr('type') === 'checkbox') {
                this.$filter.find(`[name="${key}"][value="${val}"]`).prop('checked', true);
            } else if (els) {
                els.val(val);
            }
        });
    }

    init() {
        this.$filter.on('change', () => this.updateData());
        this.$sortForm.on('change', () => this.updateData());

        this.$pagination.on('click', 'a', (ev) => {
            ev.preventDefault();
            this.data.pagination.page = Number(ev.currentTarget.getAttribute('href'));
            this.updateUrl();
            this.updatePage(this.server.findAll(this.data));
        });

        window.onpopstate = (ev) => {
            this.data = ev.state.data;
            this.updatePage(this.server.findAll(this.data));
        };
    }
}
