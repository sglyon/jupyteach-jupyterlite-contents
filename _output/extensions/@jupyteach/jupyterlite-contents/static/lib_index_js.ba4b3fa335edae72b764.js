"use strict";
(self["webpackChunk_jupyteach_jupyterlite_contents"] = self["webpackChunk_jupyteach_jupyterlite_contents"] || []).push([["lib_index_js"],{

/***/ "./lib/contents.js":
/*!*************************!*\
  !*** ./lib/contents.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "JupyteachContents": () => (/* binding */ JupyteachContents)
/* harmony export */ });
/* harmony import */ var _jupyterlite_contents__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlite/contents */ "webpack/sharing/consume/default/@jupyterlite/contents/@jupyterlite/contents");
/* harmony import */ var _jupyterlite_contents__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlite_contents__WEBPACK_IMPORTED_MODULE_0__);

/**
 * A class to handle requests to /api/contents
 */
class JupyteachContents extends _jupyterlite_contents__WEBPACK_IMPORTED_MODULE_0__.Contents {
    /**
     * Save a file.
     *
     * @param path - The desired file path.
     * @param options - Optional overrides to the model.
     *
     * @returns A promise which resolves with the file content model when the file is saved.
     */
    async save(path, options = {}) {
        // call the superclass method
        const out = super.save(path, options);
        // now do custom stuffs
        console.log('I am in the custom save method!!!', { path, options, out });
        return out;
    }
}


/***/ }),

/***/ "./lib/index.js":
/*!**********************!*\
  !*** ./lib/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _jupyterlite_localforage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlite/localforage */ "webpack/sharing/consume/default/@jupyterlite/localforage/@jupyterlite/localforage");
/* harmony import */ var _jupyterlite_localforage__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlite_localforage__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _jupyterlite_contents__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jupyterlite/contents */ "webpack/sharing/consume/default/@jupyterlite/contents/@jupyterlite/contents");
/* harmony import */ var _jupyterlite_contents__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_jupyterlite_contents__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _contents__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./contents */ "./lib/contents.js");
/* harmony import */ var _jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @jupyterlab/coreutils */ "webpack/sharing/consume/default/@jupyterlab/coreutils");
/* harmony import */ var _jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_2__);




const contentsPlugin = {
    id: '@jupyteach/server-extension:contents',
    requires: [_jupyterlite_localforage__WEBPACK_IMPORTED_MODULE_0__.ILocalForage],
    autoStart: true,
    provides: _jupyterlite_contents__WEBPACK_IMPORTED_MODULE_1__.IContents,
    activate: (app, forage) => {
        console.log('activating custom contents plugin');
        const storageName = _jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_2__.PageConfig.getOption('contentsStorageName');
        const storageDrivers = JSON.parse(_jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_2__.PageConfig.getOption('contentsStorageDrivers') || 'null');
        const { localforage } = forage;
        const contents = new _contents__WEBPACK_IMPORTED_MODULE_3__.JupyteachContents({
            storageName,
            storageDrivers,
            localforage
        });
        app.started.then(() => contents.initialize().catch(console.warn));
        return contents;
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ([contentsPlugin]);


/***/ })

}]);
//# sourceMappingURL=lib_index_js.ba4b3fa335edae72b764.js.map