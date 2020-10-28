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
        this.server = new LikeServer();
        this.data = {
            params: {},
            pagination: {}
        };

        if (!!CatalogPage.instance) {
            return CatalogPage.instance;
        }
        this.cardTemplate = document.getElementById('card');
        this.loadedPages = {};
        this.pageName = 1;
        this.savePage();

        CatalogPage.instance = this;

        return this;
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


        history.pushState({ page: this.savePage() }, '', window.location.origin + '?' + queryStrArr.join('&'));
    }

    savePage() {
        const pageName = this.pageName;

        this.loadedPages[pageName] = document.getElementById('body').innerHTML;
        this.pageName++;

        return pageName;
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
        this.data.pagination = pagination;
        this.data.params = params;
        this.updatePage(this.server.findAll(this.data));
        this.updateUrl();
        console.log('data', this.data);
    }

    updatePage(data) {
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

    init() {
        this.$filter.on('change', () => this.updateData());
        this.$sortForm.on('change', () => this.updateData());
    }
}
