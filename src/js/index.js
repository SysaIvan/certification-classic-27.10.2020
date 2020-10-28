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
});
