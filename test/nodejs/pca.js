/**
 * Copyright (c) 2015, Jozef Stefan Institute, Quintelligence d.o.o. and contributors
 * All rights reserved.
 *
 * This source code is licensed under the FreeBSD license found in the
 * LICENSE file in the root directory of this source tree.
 */

// JavaScript source code
var la = require("qminer").la;
var analytics = require("qminer").analytics;
var assert = require("../../src/nodejs/scripts/assert.js");
//Unit test for PCA

describe("PCA test", function () {
    describe("Constructor tests", function () {
        it("should not throw an exception", function () {
            assert.doesNotThrow(function () {
                var pca = new analytics.PCA();
            });
        });
        it("should return default values of parameters", function () {
            var pca = new analytics.PCA();
            var params = pca.getParams();
            assert.equal(params.iter, undefined);
            assert.equal(params.k, undefined);
        });
        it("should return values of parameters", function () {
            var pca = new analytics.PCA({ iter: 100, k: 50 });
            var params = pca.getParams();
            assert.equal(params.iter, 100);
            assert.equal(params.k, 50);
        });
        it("should return values of parameters and added keys", function () {
            var pca = new analytics.PCA({ iter: 30, alpha: 3 });
            var params = pca.getParams();
            assert.equal(params.iter, 30);
            assert.equal(params.alpha, 3);
        });
        it("should return empty model parameters", function () {
            var pca = new analytics.PCA();
            var model = pca.getModel();
            assert.equal(model.P, undefined);
            assert.equal(model.lambda, undefined);
            assert.equal(model.mu, undefined);
        });
    });
    describe("testing setParams", function () {
        it("should return changed values of parameters", function () {
            var pca = new analytics.PCA();
            pca.setParams({ iter: 10, k: 5 });
            var params = pca.getParams();
            assert.equal(params.iter, 10);
            assert.equal(params.k, 5);
        });
        it("should return changed values of parameters and added key values", function () {
            var pca = new analytics.PCA();
            pca.setParams({ iter: 10, beta: 30 });
            var params = pca.getParams();
            assert.equal(params.iter, 10);
            assert.equal(params.beta, 30);
        });
    });
    describe("Fit testing", function () {
        it("should not throw an exception creating a model", function () {
            var pca = new analytics.PCA();
            var matrix = new la.Matrix([[1, -1], [0, 0]]);
            assert.doesNotThrow(function () {
                pca.fit(matrix);
            });
        });
        it("should throw an exception because k is bigger than matrix dimensions", function () {
            var pca = new analytics.PCA({ k: 5 });
            var matrix = new la.Matrix([[1, -1], [0, 0]]);
            if (require('qminer').flags.blas) {
                assert.doesNotThrow(function () {
                    pca.fit(matrix);
                });
            } else {
                assert.throws(function () {
                    pca.fit(matrix);
                });
            }
        });
        it("should return the model parameters after using fit", function () {
            var pca = new analytics.PCA();
            var matrix = new la.Matrix([[0, 1], [-1, 0]]);
            pca.fit(matrix);
            var model = pca.getModel();
            assert.eqtol(model.lambda[0], 1);
            assert.eqtol(model.lambda[1], 0);
            assert.eqtol(model.mu[0], 0.5);
            assert.eqtol(model.mu[1], -0.5);
            assert.eqtol(Math.abs(model.P.at(0, 0)), 0.707106781186547);
            assert.eqtol(Math.abs(model.P.at(1, 0)), 0.707106781186547);
            assert(model.P.at(0, 0) * model.P.at(1, 0) > 0);
            assert.eqtol(model.P.getCol(0).inner(model.P.getCol(1)), 0);
        });
    });
    describe("Ultimate test", function () {
        it("should achive perfect reconstruction", function () {
            var A = new la.Matrix([[10, 20, 110, 20, 10], [3, 4, 13, 63, 1]]);
            var pca = new analytics.PCA({ k: 2, iter: 1000 });
            pca.fit(A);
            var pA = pca.transform(A);
            var rA = pca.inverseTransform(pA);
            assert(A.minus(rA).frob() < 1e-6);
        });
    })
});
