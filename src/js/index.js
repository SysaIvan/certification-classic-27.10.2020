// -----------------------------------------------------------------------------
// Deps
// -----------------------------------------------------------------------------

// global
import jQuery from 'js#/lib/jquery';
// styles
import 'sass#/style.scss';
// scripts
import { demo } from 'js#/modules/demo-module';
import { CatalogPage } from 'js#/modules/CatalogPage';

// -----------------------------------------------------------------------------
// Initialize
// -----------------------------------------------------------------------------

jQuery(function ($) {
	demo();
	const page = new CatalogPage();
	page.init();

	window.onpopstate = (ev) => {
		console.log(ev.state, page.loadedPages, page.loadedPages[ev.state.page]);

		$('#body').html(page.loadedPages[ev.state.page]);

		const newPage = new CatalogPage();
		newPage.init();
	};
});
